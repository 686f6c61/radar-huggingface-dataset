# tinytrashlabs/LuxTTS-mlx

## Resumen

LuxTTS-mlx es una conversión a MLX de LuxTTS, un modelo de síntesis de texto a voz (TTS) con clonación de voz. Desarrollado por Tiny Trash Labs para Gloam Voice Studio, este repositorio publica los pesos en formato safetensors nativo de MLX, lo que permite ejecutarlo directamente en Apple silicon sin necesidad de convertir manualmente los pesos originales de torch/ONNX. El modelo base, YatharthS/LuxTTS, está licenciado bajo Apache-2.0 y hereda esa licencia. La conversión mantiene la precisión fp32, que según el autor es preferible a fp16 para clonaciones a partir de grabaciones cortas. El repositorio incluye dos archivos de pesos: uno para el modelo ZipVoiceDistill (468 MB) y otro para el vocoder Vocos (61 MB), además de la configuración y el vocabulario fonético. No se han publicado benchmarks ni datos de entrenamiento en la información disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ZipVoiceDistill (TTS) + Vocos vocoder |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp32 (sin cuantizacion) |
| Idiomas soportados | ingles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo es una conversión directa de LuxTTS a MLX, no un entrenamiento nuevo. La arquitectura subyacente es ZipVoiceDistill, que incluye un decodificador de voz (fm_decoder), un codificador de texto (text_encoder) y embeddings. El vocoder es Vocos, un modelo de síntesis de audio neuronal que genera audio a 24 kHz. La conversión consistió en un re-mapeo de claves y una transposición del layout de las capas convolucionales para que los pesos carguen en MLX. No se ha realizado ningún ajuste fino ni cuantización. Los datos de entrenamiento, el número de tokens y si se usó RLHF/DPO no están disponibles en la información proporcionada.

## Capacidades

- Generación de voz (text-to-speech) en inglés.
- Clonación de voz a partir de grabaciones de referencia.
- Ejecución nativa en Apple silicon mediante MLX.
- Precisión fp32, que evita artefactos en clonaciones con grabaciones cortas (según el autor).
- Vocoder Vocos integrado para síntesis de audio a 24 kHz.
- No soporta tool calling, agentes, visión ni razonamiento multi-paso (es un modelo de TTS).
- No es multilingüe: solo inglés.

## Casos de uso

- Clonación de voz para asistentes en macOS/iOS: el modelo puede generar una voz personalizada a partir de una grabación corta y ejecutarse en tiempo real en Apple silicon, integrándose en aplicaciones nativas mediante EngineKit.
- Narración de audiolibros: generar voz natural y consistente para leer libros, aprovechando la calidad fp32 y la ausencia de artefactos en referencias largas.
- Doblaje de contenido audiovisual: clonar la voz de un locutor para producir doblajes en inglés, con el vocoder Vocos generando audio a 24 kHz.
- Accesibilidad: aplicaciones de lectura de pantalla para usuarios con discapacidad visual, usando una voz personalizada o la voz por defecto.
- Estudio de voz (Gloam Voice Studio): integrar el modelo en un editor de voz para que los usuarios clonen su propia voz y la usen en producción.
- Prototipado de diálogos para juegos: generar líneas de voz para personajes en fase de desarrollo, sin necesidad de un estudio de grabación.
- E-learning: narración automática de material didáctico en inglés, con posibilidad de personalizar la voz del narrador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. El repositorio pesa 0,6 GB en fp32, lo que sugiere que cabe en la memoria unificada de cualquier Mac con Apple silicon.
- GPU recomendadas: Apple silicon (M1, M2, M3, M4) con MLX. No es compatible con GPU NVIDIA o AMD sin conversión adicional.
- Sí cabe en consumer GPU: sí, en cualquier Mac con Apple silicon.
- Opciones de despliegue: MLX (librería), EngineKit (Gloam Voice Studio). No se han documentado integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

El modelo es una conversión de YatharthS/LuxTTS, que es la referencia directa. No se dispone de información suficiente para comparar con otros modelos TTS de la misma categoría.

| Modelo | Formato | Licencia | Idiomas | Tamaño |
|---|---|---|---|---|
| LuxTTS-mlx | MLX safetensors | Apache-2.0 | en | 0,6 GB |
| LuxTTS (YatharthS) | Torch/ONNX | Apache-2.0 | en | no disponible |
| Otros modelos TTS | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Sesgos conocidos: no disponible. No se han publicado evaluaciones de sesgo.
- Riesgo de alucinación: en TTS, el modelo puede generar artefactos o pronunciaciones incorrectas. El autor indica que la versión fp16 producía artefactos en clonaciones con grabaciones cortas; la versión fp32 los evita, pero no hay garantías formales.
- Limitaciones de idioma: solo inglés. No soporta otros idiomas ni acentos multilingües.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero exige mantener el aviso de licencia y atribución.
- Caveat importante: es una conversión de pesos, no un modelo entrenado desde cero. No ha sido validado en producción (0 descargas, 0 likes). Requiere los cuatro archivos juntos y una versión de MLX compatible. No funciona en entornos que no sean Apple silicon sin conversión adicional.

## Enlaces

- HuggingFace: https://huggingface.co/tinytrashlabs/LuxTTS-mlx
- Modelo base: https://huggingface.co/YatharthS/LuxTTS
- Vocos: https://github.com/gemelo-ai/vocos
- Tiny Trash Labs: https://tinytrashlabs.com
- Gloam Voice Studio: https://gloam.fm/studio
