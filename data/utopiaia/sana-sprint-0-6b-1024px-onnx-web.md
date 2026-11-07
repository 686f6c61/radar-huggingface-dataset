# UtopiaIA/sana-sprint-0.6b-1024px-onnx-web

## Resumen

SANA-Sprint 0.6B 1024px ONNX Web es una conversión a formato ONNX del modelo de difusión texto-a-imagen SANA-Sprint 0.6B 1024px, desarrollado originalmente por el equipo Sana de NVIDIA Labs (NVlabs). Esta versión, publicada por UtopiaIA, está empaquetada específicamente para ejecutarse en el navegador mediante ONNX Runtime Web sobre WebGPU, tal y como se emplea en la aplicación image.elffuss.com. El repositorio contiene únicamente los pesos convertidos; el tokenizador y los ficheros de configuración se leen del repositorio original en la revisión `aa76e7f4f4928f378716b6716a2130fba3caf5b1`.

El modelo base SANA-Sprint es un modelo de difusión para generación texto-a-imagen que reduce los pasos de inferencia de los 20 habituales a solo 1-4 pasos, manteniendo un rendimiento de vanguardia. Con 0.6B parámetros y resolución nativa de 1024px, está diseñado para ser ultraeficiente, lo que lo hace idóneo para entornos con recursos limitados como el navegador. La conversión incluye un encoder de texto Gemma 2 2B IT cuantizado a 4 bits, el transformer en fp16 (con atención lineal en fp32) y el decoder del autoencoder DC-AE en fp16.

La relevancia de esta ficha radica en que permite ejecutar un generador de imágenes de calidad en el propio cliente web, sin necesidad de servidores GPU dedicados, gracias a la combinación de WebGPU, cuantización de pesos y la arquitectura eficiente de SANA-Sprint. El repositorio ocupa 3.1 GB y se distribuye bajo licencia Apache-2.0, aunque el encoder de texto derivado de Gemma 2 está sujeto a los Términos de Uso y la Política de Uso Prohibido de Gemma.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de difusión (SANA-Sprint) con transformer y atención lineal; autoencoder DC-AE; encoder de texto Gemma 2 2B IT |
| Parámetros totales | 0.6B (modelo de difusión); el encoder de texto Gemma 2 2B IT añade aproximadamente 2B adicionales (no se especifica el total combinado) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo texto-a-imagen, no procesa contexto de texto largo de forma explícita) |
| Tipos de cuantización | Pesos del encoder de texto en 4 bits (MatMulNBits, bloques de 32, activaciones float32); transformer en float16 (atención lineal en float32); decoder VAE en float16 |
| Idiomas soportados | No disponible (el encoder de texto Gemma 2 2B IT es multilingüe, pero no se detalla en la información proporcionada) |
| Licencia | Apache-2.0 (el encoder de texto derivado de Gemma 2 está sujeto a los Términos de Uso y la Política de Uso Prohibido de Gemma) |
| Formato de pesos | ONNX (modelos `.onnx` y ficheros binarios `.bin` para embeddings cuantizados) |

## Arquitectura y entrenamiento

SANA-Sprint es un modelo de difusión para texto-a-imagen que emplea un transformer con atención lineal, diseñado para generar imágenes de alta calidad en muy pocos pasos de inferencia (1-4 pasos). El modelo base fue entrenado por NVlabs y presentado como un modelo unificado y adaptativo al número de pasos, lo que elimina la necesidad de entrenar variantes específicas para cada número de pasos. Integra además ControlNet para generación interactiva en tiempo real. La versión convertida a ONNX mantiene la arquitectura del transformer en float16, con la atención lineal en float32 para preservar la estabilidad numérica, y utiliza el decoder del autoencoder DC-AE en float16 para reconstruir la imagen final a partir de los latentes.

El pipeline de conversión sigue el `SanaSprintPipeline` de diffusers: el muestreador, la instrucción del prompt y el ruido se gestionan de forma equivalente, de modo que con el mismo prompt, semilla, pasos y tamaño, las imágenes resultantes son cercanas a las de referencia (misma composición y detalle). El encoder de texto es Gemma 2 2B IT, cuantizado a 4 bits con MatMulNBits en bloques de 32 y activaciones float32; la tabla de embeddings (256000 × 2304) se almacena en 4 bits simétricos por bloques de 32 a lo largo de cada fila, con una escala float16 por bloque. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO en el modelo original.

## Capacidades

- Generación de imágenes a partir de descripciones textuales (text-to-image) con resolución nativa de 1024px.
- Generación en muy pocos pasos de inferencia (1-4 pasos), lo que reduce la latencia y el coste computacional.
- Ejecución en el navegador mediante ONNX Runtime Web y WebGPU, sin necesidad de backend GPU dedicado.
- Integración con ControlNet en el modelo original para generación interactiva en tiempo real (no se especifica si esta conversión ONNX incluye ControlNet).
- El encoder de texto Gemma 2 2B IT aporta capacidades multilingües (aunque no se detallan los idiomas soportados en la información proporcionada).
- No se mencionan capacidades de tool calling, agentes, razonamiento multi-paso ni modos de pensamiento (thinking mode), ya que es un modelo de generación de imágenes.

## Casos de uso

- Generación de imágenes en aplicaciones web sin backend GPU: el modelo se ejecuta en el navegador del usuario mediante WebGPU, lo que permite ofrecer funcionalidad de texto-a-imagen sin incurrir en costes de servidores GPU y sin enviar los prompts a un servidor externo.
- Herramientas de diseño y prototipado rápido: los diseñadores pueden generar bocetos o variaciones visuales a partir de descripciones textuales directamente en el navegador, con latencia baja gracias a los 1-4 pasos de inferencia.
- Creación de contenido para redes sociales o blogs: generación de ilustraciones o imágenes de acompañamiento a partir de texto, con resolución de 1024px adecuada para publicación web.
- Aplicaciones educativas o demostraciones interactivas: al ejecutarse en el cliente, permite crear demos de generación de imágenes sin infraestructura compleja, ideal para talleres o entornos docentes.
- Privacidad y procesamiento local: al no requerir envío de datos a un servidor, es adecuado para escenarios donde los prompts o las imágenes generadas no deben salir del dispositivo del usuario.
- Integración en editores o herramientas creativas basadas en web: puede incorporarse en aplicaciones de edición de imágenes o generación de contenido que ya utilizan WebGPU, aprovechando la eficiencia del modelo para generar imágenes de fondo o elementos visuales bajo demanda.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 3.1 GB, pero al ejecutarse en el navegador la memoria utilizada depende de la implementación de WebGPU y del navegador. El encoder de texto en 4 bits reduce significativamente el uso de memoria frente a fp16.
- GPU recomendadas: al estar orientado a WebGPU, requiere un navegador compatible con WebGPU (por ejemplo, Chrome o Edge en versiones recientes) y una GPU integrada o dedicada que soporte WebGPU. No se especifican modelos concretos de GPU en la información proporcionada.
- ¿Cabe en GPU consumer? Sí, está diseñado para ejecutarse en el navegador con WebGPU, lo que incluye GPU integradas y dedicadas de consumo, aunque no se detallan los requisitos mínimos exactos.
- Opciones de despliegue: ONNX Runtime Web sobre WebGPU (principal); también podría ejecutarse con otros runtimes de ONNX, pero la información solo menciona onnxruntime-web.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Se puede mencionar que el modelo base SANA-Sprint 0.6B 1024px compite con otros modelos de difusión texto-a-imagen eficientes, pero no se han facilitado datos concretos de comparación (parámetros, contexto, rendimiento, licencia) de alternativas. Por tanto, se indica "no disponible".

## Limitaciones y advertencias

- El modelo es una conversión a ONNX para navegador; no se garantiza que todas las funcionalidades del modelo original (como ControlNet) estén disponibles en esta versión.
- El encoder de texto Gemma 2 2B IT está sujeto a los Términos de Uso y la Política de Uso Prohibido de Gemma, además de la licencia Apache-2.0 del conjunto; es responsabilidad del usuario cumplir con estas restricciones.
- Riesgo de alucinación visual: como todo modelo generativo, puede producir imágenes incoherentes o no fieles al prompt, especialmente con descripciones ambiguas o complejas.
- Sesgos conocidos: no se detallan en la información proporcionada, pero los modelos de difusión entrenados con datos web pueden heredar sesgos de género, raza o cultura.
- Limitaciones de idioma: aunque el encoder Gemma 2 es multilingüe, no se especifica qué idiomas están soportados oficialmente ni la calidad en cada uno.
- Restricciones de licencia para uso comercial: Apache-2.0 permite uso comercial, pero las restricciones de Gemma deben revisarse para el encoder de texto.
- Caveat para producción: al ejecutarse en el navegador, el rendimiento depende del hardware del usuario y del soporte de WebGPU; la compatibilidad puede variar entre navegadores y dispositivos. Además, el tamaño del repositorio (3.1 GB) implica una descarga inicial considerable para el usuario final.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/UtopiaIA/sana-sprint-0.6b-1024px-onnx-web)
- [Modelo base SANA-Sprint 0.6B 1024px](https://huggingface.co/Efficient-Large-Model/Sana_Sprint_0.6B_1024px_diffusers)
- [Página oficial de SANA-Sprint (NVlabs)](https://nvlabs.github.io/Sana/Sprint/)
- [Aplicación de demostración image.elffuss.com](https://image.elffuss.com/)
