# tkb77/smolvla-oekaki-goal

## Resumen

SmolVLA Oekaki G es un modelo de política visuomotora (vision-language-action, VLA) obtenido por fine-tuning de `lerobot/smolvla_base` para una tarea muy concreta: dibujar sobre papel con un brazo robótico SO-101 simulado en MuJoCo que sostiene un bolígrafo con muelle. Lo desarrolla el usuario `tkb77` y se publica bajo licencia Apache-2.0. La particularidad del modelo es que, además de la instrucción textual y de las dos cámaras habituales (vista cenital y vista de muñeca), recibe una tercera imagen de entrada: la imagen objetivo del dibujo que debe copiar.

El modelo resuelve el problema de control de un manipulador para trazado de trazos a partir de una referencia visual, sin necesidad de definir trayectorias explícitas. Con 450 millones de parámetros, se sitúa en la franja de los VLA ligeros, lo que permite entrenamiento y evaluación rápida en simulación. Su relevancia actual es doble: por un lado, demuestra que condicionar la política con una imagen objetivo mejora de forma sustancial la precisión del dibujo frente a la misma receta sin esa entrada; por otro, sirve como pieza de una cadena más amplia en la que un modelo de difusión de bocetos (`tkb77/oekaki-sketch-diffusion`) genera la imagen objetivo a partir de un prompt de texto.

Es un modelo de nicho, orientado a investigación en robótica y a reproducir el pipeline completo de simulación, no a despliegues de producción generalistas. La ventana de contexto no aplica en el sentido de los LLM: la entrada es multimodal con imágenes de 256×256 y un estado de 8 dimensiones, y la salida es un chunk de 50 pasos de acciones articulares a 30 Hz.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action) sobre `lerobot/smolvla_base`; no se detalla la composición interna en la información disponible |
| Parámetros totales | 450.046.176 |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible (no aplica como contexto de texto; entrada multimodal con imágenes de 3×256×256 y estado de 8 dimensiones) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (las instrucciones de entrenamiento son texto; no se especifican idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería `lerobot`), con metadatos adicionales en `oekaki_extras.json` |

## Arquitectura y entrenamiento

El modelo parte de `lerobot/smolvla_base`, un VLA de 450 millones de parámetros, y se ajusta de forma supervisada sobre el dataset `tkb77/oekaki-goal-v1`, compuesto por 999 episodios expertos y 421.000 fotogramas. La entrada combina tres imágenes de 3×256×256 (cámara cenital, cámara de muñeca e imagen objetivo con líneas negras sobre blanco en coordenadas del papel), un vector de estado de 8 dimensiones (5 articulaciones, pinza, contacto del bolígrafo como 0/1 y compresión del muelle en milímetros) y una instrucción en texto. La salida es un chunk de 50×6: objetivos articulares a 30 Hz. El entrenamiento se realizó durante 15.000 pasos con un tamaño de lote efectivo de 64.

Sobre la receta base se añaden dos extensiones implementadas en el repositorio de código y registradas en `oekaki_extras.json`: un *real-time chunking* en tiempo de entrenamiento y una entrada de tiempo transcurrido. Estas modificaciones implican que el checkpoint no se puede cargar con LeRobot estándar tal cual: requiere el código de `oekaki/policy/` del repositorio. En el 30 % de las instrucciones de entrenamiento no se nombra la categoría del dibujo, lo que obliga al modelo a apoyarse en la imagen objetivo. Los objetivos de entrenamiento provienen del dataset Quick, Draw! (Google Creative Lab, CC BY 4.0).

## Capacidades

- Generación de acciones de control articular para un brazo SO-101 simulado, en chunks de 50 pasos a 30 Hz.
- Condicionamiento por imagen objetivo: copia un dibujo de referencia colocado sobre el papel, además de atender a la instrucción textual.
- Seguimiento de instrucciones de texto del tipo "draw a star", con capacidad de operar cuando la instrucción no nombra la categoría.
- Percepción multimodal con dos cámaras (cenital y de muñeca) más la imagen objetivo.
- Uso del estado propioceptivo, incluida la detección de contacto del bolígrafo y la compresión del muelle.
- Integración en un pipeline de dos modelos: un generador de bocetos por difusión produce la imagen objetivo y este modelo la dibuja.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni otros idiomas.

## Casos de uso

- Investigación en VLA condicionados por objetivo visual: reproducir el experimento de comparación con y sin imagen objetivo para estudiar cuánto aporta la referencia visual frente a la instrucción textual sola.
- Benchmark de trazado robótico en simulación: usar las 250 episodios de evaluación con dibujos de Quick, Draw! retenidos para medir IoU del objetivo y error de posición en milímetros de forma estandarizada.
- Generación automática de bocetos y ejecución: encadenar `tkb77/oekaki-sketch-diffusion` con este modelo mediante `scripts/imagine_and_draw.py` para pasar de un prompt de texto a un dibujo ejecutado por el robot.
- Estudio de control de fuerza en contacto: el estado incluye contacto del bolígrafo y compresión del muelle, lo que permite analizar políticas que regulan la presión del útil sobre el papel.
- Base para fine-tuning en nuevas categorías de dibujo: el checkpoint y el pipeline de datos sirven de punto de partida para ampliar el conjunto de formas más allá de círculo, cuadrado, triángulo, estrella y cara sonriente.
- Docencia y divulgación en robótica: el stack completo (MuJoCo, SO-101, LeRobot) y una latencia de inferencia baja permiten demostraciones reproducibles en un portátil con GPU de consumo.
- Evaluación de extensiones de política: comparar el efecto del *real-time chunking* y de la entrada de tiempo transcurrido frente a la receta base de SmolVLA.

## Benchmarks y rendimiento

Resultados en simulación publicados en la model card. Objetivos de test: dibujos de Quick, Draw! retenidos, 250 episodios por configuración. Inferencia con σ = 0, replanificación cada 30 pasos, latencia 3 y *real-time chunking*.

| Configuración | Este modelo | Misma receta sin imagen objetivo |
|---|---|---|
| IoU del objetivo, objetivo real | 0,51 | 0,19 |
| Error de posición, objetivo real | 5,1 mm | 24,9 mm |
| IoU del objetivo, objetivo imaginado por el modelo de difusión | 0,53 | no disponible |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no son aplicables a un modelo de política robótica.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 450 millones de parámetros en safetensors, el peso en FP32 ronda 1,8 GB y en FP16/BF16 unos 0,9 GB, a lo que se suma el coste de las tres imágenes de 256×256 y del decodificador de acciones. Cifra exacta no publicada.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cualquier GPU con al menos 4-8 GB de VRAM debería ser suficiente; no se confirma oficialmente.
- GPU de consumo: previsiblemente sí, en tarjetas tipo RTX 3060/4060 o superiores, aunque el dato no está verificado en la información disponible.
- Despliegue: el modelo requiere el repositorio `tkb77/oekaki-vla` y su entorno `uv` con Python 3.12; se ejecuta con `MUJOCO_GL=egl` y el script `scripts/imagine_and_draw.py`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: la model card indica "latency 3" como parámetro de inferencia, sin definir unidades ni throughput. No hay más datos de rendimiento temporal.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Rendimiento en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tkb77/smolvla-oekaki-goal | 450 M | 3 imágenes 256×256 + estado 8 + texto | IoU 0,51; error 5,1 mm | Apache-2.0 | HuggingFace, requiere repo de código |
| Misma receta sin imagen objetivo (ablación del autor) | 450 M (aproximado, no confirmado) | 2 imágenes 256×256 + estado 8 + texto | IoU 0,19; error 24,9 mm | no disponible | no disponible como checkpoint independiente |
| lerobot/smolvla_base | 450 M (modelo base) | Entrada VLA estándar de LeRobot | No evaluado en esta tarea | no disponible en la información | HuggingFace |
| tkb77/oekaki-sketch-diffusion | no disponible | Texto a imagen de boceto | No comparable (genera el objetivo, no dibuja) | no disponible | HuggingFace |

No se dispone de comparación con otros VLA de dibujo robótico en la información proporcionada.

## Limitaciones y advertencias

- Solo simulación: no hay evidencia de transferencia a un robot físico; todo el entrenamiento y la evaluación son en MuJoCo.
- Dominio muy restringido: cinco categorías (círculo, cuadrado, triángulo, estrella y cara sonriente) y un único dibujo por imagen objetivo.
- Detalles frágiles: las puntas finas de la estrella y los ojos de la cara sonriente suelen romperse, según el propio autor.
- Dependencia de código externo: el checkpoint no carga con LeRobot estándar; necesita `oekaki/policy/` y los metadatos de `oekaki_extras.json`.
- Riesgo de alucinación: no aplica en el sentido textual, pero la política puede generar trazos que no correspondan al objetivo cuando la imagen de referencia es ambigua o está fuera de distribución.
- Idiomas: no se especifican; las instrucciones de entrenamiento son en inglés y no hay evaluación multilingüe.
- Sesgos: no documentados; el dataset de objetivos proviene de Quick, Draw!, con el sesgo de estilo y vocabulario de esa colección.
- Licencia: Apache-2.0 permite uso comercial, pero los objetivos de entrenamiento derivan de Quick, Draw! (CC BY 4.0), lo que exige atribución a Google Creative Lab para ese material.
- Madurez: 12 descargas y 0 likes en el momento de la consulta; proyecto de investigación reciente, sin validación externa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tkb77/smolvla-oekaki-goal
- Dataset de entrenamiento: https://huggingface.co/datasets/tkb77/oekaki-goal-v1
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Generador de bocetos: https://huggingface.co/tkb77/oekaki-sketch-diffusion
- Código, simulación y evaluación: https://github.com/tkb77/oekaki-vla
- Dataset Quick, Draw!: https://quickdraw.withgoogle.com/data
