import 'package:flutter/cupertino.dart';

/// Widget that provides animation of expanding a widget from invisible to full size and reversly
///
/// * **[child]** - widget that will be animated
/// * **[isOpened]** - Variable defines if widget should be opened or not
class AppAnimatedExpansion extends StatefulWidget {
  const AppAnimatedExpansion(
      {super.key, required this.child, required this.isOpened});

  @override
  State<AppAnimatedExpansion> createState() => _AppAnimatedExpansionState();

  /// Widget that will be animated
  final Widget child;

  /// Function that opens or closes widget and returns state of opening
  final bool isOpened;
}

class _AppAnimatedExpansionState extends State<AppAnimatedExpansion>
    with SingleTickerProviderStateMixin {
  /// Variable that controlls animation
  late AnimationController _animationController;

  bool _isOpened = false;

  @override
  void initState() {
    /// Configuration of animation and animation controller which controll visibility of body
    _animationController = AnimationController(
      value: 0,
      duration: const Duration(milliseconds: 300),
      vsync: this,
    );
    updateExpansion();
    super.initState();
  }

  @override
  void didUpdateWidget(covariant AppAnimatedExpansion oldWidget) {
    updateExpansion();
    super.didUpdateWidget(oldWidget);
  }

  void updateExpansion() {
    setState(() {
      _isOpened = widget.isOpened;
    });
    if (_isOpened) {
      _animationController.forward();
    } else {
      _animationController.reverse();
    }
  }

  @override
  Widget build(BuildContext context) {
    return SizeTransition(
        axisAlignment: 0,
        sizeFactor: _animationController,
        child: widget.child);
  }
}
