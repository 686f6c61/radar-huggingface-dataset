# vector-institute/mars

## Resumen

MARS (Multiscale Appearance-Residual Streams) es un detector de falsificaciones de vídeo desarrollado por Vector Institute. A diferencia de los detectores centrados exclusivamente en manipulación facial, MARS cubre tanto el face swapping y el reenactment como el vídeo íntegramente generado por IA, operando sobre el fotograma completo. El modelo se construye sobre el codificador congelado Perception Encoder PE-Core-L (ViT-L/14 a 336 píxeles) y añade dos ramas: una de residuos multiescala espacio-temporal y otra semántica, combinadas mediante una compuerta que devuelve P(manipulado) por clip.

El checkpoint publicado contiene 67,5 millones de parámetros entrenables sobre el codificador congelado, con pesos en safetensors (270 MB) y un grafo ONNX completo que incluye el codificador (1,56 GB). La licencia es Apache 2.0, lo que facilita su integración en productos comerciales de moderación y verificación de contenido.

Su relevancia actual reside en la proliferación de vídeo sintético de alta calidad: MARS ofrece una única puntuación a nivel de clip para vídeos completos, con un pipeline de preprocesado determinista (muestreo cada dos fotogramas, clips de 64 frames, redimensionado a 336x336) y una ruta de despliegue sin PyTorch mediante ONNX Runtime.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ViT-L/14 (PE-Core-L congelado) con rama de residuos multiescala espacio-temporal (transformer temporal) y rama semántica con LayerNorm ajustados; fusión por compuerta |
| Parámetros totales | 67.540.874 (entrenables; el codificador congelado se descarga aparte) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (clip fijo de 64 fotogramas, stride 2, resolución 336x336) |
| Tipos de cuantización | no disponible (pesos safetensors en precisión de entrenamiento; ONNX float32) |
| Idiomas soportados | no disponible (modelo de visión, no lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (270 MB), ONNX (1,56 GB), config.yaml |

## Arquitectura y entrenamiento

MARS parte de un Perception Encoder PE-Core-L (ViT-L/14, parche 14, entrada 336x336) que permanece congelado. Sobre él se construyen dos caminos. El camino de residuos compara las características intermedias de parches del codificador con copias suavizadas de sí mismas, en varias escalas espaciales y temporales, y un transformer temporal modela cómo evolucionan esas diferencias a lo largo del clip. El camino semántico clasifica fotogramas muestreados con el codificador completo, ajustando únicamente copias propias de los parámetros LayerNorm. Una compuerta mezcla ambas rutas por clip y produce la probabilidad de manipulación.

El entrenamiento consistió en un fine-tuning sobre el modelo base, ejecutado en 4 GPU NVIDIA A40 durante 17,36 horas GPU (5,46 kWh, 0,35 kg CO2eq medidos con CodeCarbon en Ontario, Canadá). No se detalla en la información disponible el volumen de tokens ni la composición exacta del dataset; la model card remite al paper arXiv:2611.12508 para los detalles de entrenamiento y resultados.

## Capacidades

- Detección de falsificación de vídeo a nivel de clip: devuelve P(manipulado) y logits (auténtico/manipulado) para clips de 64 fotogramas.
- Cobertura de manipulación facial (face swapping, reenactment) y de vídeo completamente generado.
- Análisis de fotograma completo, no limitado a regiones faciales.
- Puntuación agregada a nivel de vídeo: media de P(manipulado) sobre todos los clips.
- Manejo de vídeos cortos o clips incompletos mediante `n_valid` y padding por repetición del último fotograma.
- Despliegue dual: PyTorch con safetensors (requiere el repositorio `mars`) u ONNX Runtime sin PyTorch.
- No soporta tool calling, agentes, generación de texto ni capacidades multilingües: es un clasificador de vídeo.

## Casos de uso

- Moderación de contenido en plataformas: puntuar automáticamente vídeos subidos por usuarios y derivar a revisión humana los que superen un umbral calibrado sobre datos propios, cubriendo tanto deepfakes faciales como vídeo generado.
- Verificación periodística: comprobar material audiovisual recibido antes de publicación, con una única puntuación por vídeo y trazabilidad del pipeline de preprocesado.
- Detección de fraude con identidad sintética: analizar vídeos de verificación de identidad (KYC) para detectar reenactment o face swapping antes de aprobar la cuenta.
- Monitorización de campañas de desinformación: procesar lotes de vídeos virales y priorizar los sospechosos para análisis forense humano.
- Investigación en forense multimedia: usar la rama de residuos y las puntuaciones por clip como señal de referencia en estudios de detección y evaluación de robustez.
- Integración en pipelines ONNX: desplegar el grafo completo (1,56 GB) con ONNX Runtime GPU en servicios de inferencia sin dependencia de PyTorch, útil en entornos con restricciones de stack.
- Auditoría de contenido generado en estudios de medios: verificar material de archivo y detectar inserciones sintéticas en postproducción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite al paper arXiv:2611.12508 para los resultados de MARS.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el grafo ONNX ocupa 1,56 GB en disco y procesa clips de (1, 64, 3, 336, 336) float32, por lo que se requiere memoria suficiente para el codificador ViT-L y las activaciones del clip completo.
- GPU recomendadas: el entrenamiento usó 4 x NVIDIA A40; para inferencia se indica soporte de `CUDAExecutionProvider` en ONNX Runtime y `torch.autocast` bfloat16 en PyTorch.
- GPU de consumo: no confirmado en la información disponible; el tamaño del grafo y la entrada de 64 fotogramas a 336x336 sugieren que las GPU consumer de gama alta podrían ser viables, pero no hay datos publicados.
- Opciones de despliegue: ONNX Runtime (GPU o CPU), PyTorch con el paquete `mars` y safetensors; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un clasificador de vídeo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros detectores de deepfake o de vídeo sintético.

## Limitaciones y advertencias

- Las puntuaciones no están calibradas: para tomar decisiones binarias debe elegirse un umbral sobre datos de validación del propio entorno.
- El preprocesado es fijo (muestreo cada dos fotogramas, clips de 64, 336x336, sin recorte); desviarse de él invalida las puntuaciones.
- Riesgo de falsos positivos y negativos ante manipulaciones no representadas en el entrenamiento; no se documentan sesgos específicos.
- El codificador congelado no se incluye en safetensors y se descarga desde timm en el primer uso, lo que introduce una dependencia externa en el despliegue PyTorch.
- La licencia Apache 2.0 permite uso comercial, pero no se ofrece garantía ni se documentan limitaciones por región o tipo de contenido.
- No es un modelo generativo ni multilingüe: cualquier uso fuera de clasificación de vídeo queda fuera de su alcance.

## Enlaces

- Hugging Face: https://huggingface.co/vector-institute/mars
- Paper: https://arxiv.org/abs/2611.12508
- Repositorio de código: https://github.com/VectorInstitute/mars
- Página del proyecto: https://vectorinstitute.github.io/mars
