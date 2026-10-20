# yunfengwang/Ming-3.0-tts-0.5B-MNN

## Resumen

Ming-3.0-tts-0.5B-MNN es la conversión y cuantización a MNN de inclusionAI/Ming-3.0-tts-0.5B, un sistema de síntesis de voz (TTS) con un backbone Qwen2.5-0.5B. Genera audio a 44,1 kHz en chino e inglés y permite clonación de voz zero-shot a partir de una referencia. La conversión la publica yunfengwang y el modelo base pertenece a inclusionAI.

El objetivo es ejecutar todo el pipeline TTS en CPU sin PyTorch ni ONNX Runtime. La conversión cubre siete grafos MNN por nivel: el backbone `lm`, la cabeza de flow matching CFM/DiT `dit`, el `aggregator`, el encoder audio-VAE (`enc_backbone`, `enc_agg`), el decoder/vocoder `voc` y el encoder de hablante CAM++ `campplus`. Se publican cuatro niveles: fp16 (2,63 GB), int8 (1,52 GB), int4mix (0,97 GB) e int4 (0,77 GB).

Es relevante para despliegues en CPU, edge o equipos sin GPU, y para estudiar el impacto de la cuantización en un TTS completo. La licencia es MIT, siguiendo el modelo original. La model card advierte de que el inglés es débil en los checkpoints originales y de que int4 presenta
