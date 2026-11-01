# tbaumgauntlet/parallax-brain-loc-n512

## Resumen

parallax-brain-loc-n512 es un adaptador LoRA de tipo MLX publicado por el usuario tbaumgauntlet sobre el modelo multimodal mlx-community/Qwen3-VL-2B-Instruct-4bit. Su función es acotar, en una única imagen de resonancia magnética cerebral (corte 2D T1 con contraste), la caja delimitadora axis-aligned más ajustada alrededor de un tumor intracraneal, devolviendo exclusivamente un objeto JSON con coordenadas en una rejilla normalizada de 0 a 1000. No clasifica el tumor ni emite comentario diagnóstico.

El adaptador se construye sobre la arquitectura Qwen3-VL de 2.000 millones de parámetros en su conversión cuantizada a 4 bits (afín, grupo 64), y se entrena con MLX-VLM 0.7.11 en Apple Silicon. El autor lo publica explícitamente como un punto intermedio del currículo de entrenamiento (N512), no como el modelo seleccionado: sirve para regenerar la tabla de eficiencia del proyecto Parallax mediante `eval.py`. El checkpoint elegido es parallax-brain-loc-n1024.

Su relevancia es metodológica más que de producto: documenta con precisión un pipeline de ajuste fino de un VLM pequeño para localización visual en imagen médica, con hashes de pesos, revisión fijada del modelo base y evaluación IoU sobre un holdout separado por familias de pacientes. La licencia es Apache 2.0, pero el uso previsto es exclusivamente de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal Qwen3-VL (torre de visión congelada + modelo de lenguaje) con adaptadores LoRA |
| Parametros totales | 2B en el modelo base (Qwen3-VL-2B-Instruct); el adaptador LoRA añade un conjunto reducido de matrices de bajo rango |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | base en 4 bits (cuantización afín, grupo 64) según la conversión de mlx-community; el adaptador se distribuye en el formato nativo de MLX |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX (adaptador LoRA nativo de MLX; no es compatible con PyTorch/PEFT) |

## Arquitectura y entrenamiento

El modelo base es Qwen3-VL-2B-Instruct, un transformer multimodal que procesa imagen y texto. Sobre él se aplica un adaptador LoRA de rango 16 y alpha 32 (escala 2.0) con dropout 0.05, inyectado en 196 capas Linear del modelo de lenguaje: down_proj, gate_proj, k_proj, o_proj, q_proj, up_proj y v_proj. La torre de visión permanece congelada y sin adaptadores, de modo que todo el ajuste se concentra en la parte lingüística que interpreta y formatea la respuesta.

El entrenamiento usa 512 cortes de entrenamiento procedentes de 99 familias de pacientes, con cajas derivadas de máscaras de anotación humana, más 42 filas auxiliares de texto generadas por un profesor y filtradas. Se realizaron 554 actualizaciones AdamW con learning rate 0.0001, pérdida solo sobre la completación y un tiempo total de 2727 segundos en un Apple M1 Max. El prompt de inferencia es fijo, de un solo turno y con la imagen primero, e impone decodificación voraz y salida JSON estricta con la clave `bbox`, sin prosa ni comentario diagnóstico.

## Capacidades

- Localización de tumores en cortes únicos de RM cerebral T1 con contraste: devuelve `{"bbox":[x1,y1,x2,y2]}` en rejilla normalizada 0–1000 con origen en la esquina superior izquierda.
- Salida estrictamente estructurada en JSON, validada en 54 de 54 casos del holdout oficial.
- Procesamiento imagen-texto a texto (pipeline image-text-to-text) sobre una única imagen por petición.
- No nombra el tipo de tumor ni emite comentarios diagnósticos, por diseño del prompt y del entrenamiento.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, audio ni modo thinking.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Evaluación reproducible de investigación: ejecutar `eval.py` con este adaptador y su revisión fijada para regenerar la tabla de eficiencia del proyecto Parallax y comparar puntos del currículo de entrenamiento (N512 frente a N1024).
- Estudio de ajuste fino de VLMs pequeños en imagen médica: servir como referencia metodológica de LoRA sobre un modelo de 2B cuantizado a 4 bits, con hashes de adaptador y de pesos base verificables.
- Preetiquetado asistido en flujos de anotación: generar cajas candidatas sobre cortes de RM para que un radiólogo o anotador las revise y corrija, acelerando la creación de datasets, siempre en contexto de investigación.
- Análisis de robustez y formato: emplear el adaptador como caso de prueba para medir adherencia al formato JSON y sensibilidad a perturbaciones que preservan la información (el autor reporta 123/162 en adherencia de robustez).
- Comparación con prompting de modelos frontera: usar sus métricas de holdout (79,6 % con IoU ≥ 0,50) como línea base local y de bajo coste frente a sistemas propietarios.
- Docencia y prototipado en Apple Silicon: desplegar el adaptador en un Mac con MLX para demostrar pipelines de visión-lenguaje médicos sin GPU dedicada, dado el tamaño de repo de 0,1 GB y el base de 2B en 4 bits.

## Benchmarks y rendimiento

| Conjunto / métrica | Valor |
|---|---|
| Holdout oficial (54 pacientes): IoU ≥ 0,50 | 43/54 (79,6 %) |
| Holdout oficial: IoU medio / mediano | 0,627 / 0,700 |
| Holdout oficial por clase (M / G / P) | 18/18 / 10/18 / 15/18 |
| Holdout oficial: formato válido | 54/54 |
| Robustez (3 perturbaciones que preservan información × 54) | 123/162 (75,9 %) |
| Piloto de desarrollo (30, usado para selección de modelo) | 25/30, IoU medio 0,621 |
| Base sin ajustar, holdout oficial | 9/54, IoU medio 0,227 |
| Mejor prompting frontera (Gemini 4 estructurado), oficial | 50/54, IoU medio 0,780 |
| Objetivos 95 % adherencia / 90 % robustez | no alcanzados |

## Requisitos de hardware

- Hardware de referencia: Apple Silicon; el autor entrena y evalúa en un M1 Max, y el adaptador requiere el entorno MLX del repositorio Parallax (requirements-mlx.lock.txt, mlx-vlm 0.7.11).
- VRAM/unified memory estimada: no disponible de forma explícita; el modelo base son 2B parámetros en 4 bits y el repo del adaptador ocupa 0,1 GB, por lo que el peso combinado es reducido y cabe en equipos de consumo con memoria unificada suficiente.
- GPU recomendadas: no disponibles; el adaptador no carga en transformers/peft, por lo que no es desplegable directamente en stacks CUDA convencionales.
- Opciones de despliegue: MLX-VLM a través de `eval.py`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; solo se reporta el tiempo de entrenamiento (2727 s en M1 Max).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| parallax-brain-loc-n512 | 2B (base) + LoRA | no disponible | Localización de tumores en RM, adaptador MLX | Apache 2.0 | HuggingFace (MLX) |
| parallax-brain-loc-n1024 | 2B (base) + LoRA | no disponible | Checkpoint seleccionado del mismo proyecto | Apache 2.0 | HuggingFace (MLX) |
| Qwen3-VL-2B-Instruct-4bit (base sin ajustar) | 2B | no disponible | VLM generalista | Apache 2.0 | HuggingFace (MLX) |
| Gemini 4 con prompting estructurado | no disponible | no disponible | VLM propietario, referencia de prompting | propietaria | API |

## Limitaciones y advertencias

- Uso exclusivamente de investigación; no validado para diagnóstico ni para ninguna decisión clínica.
- Entrenado con cortes 2D de un único dataset público (un solo grupo institucional); la evaluación separa por familias de pacientes solo dentro de ese dataset.
- Gliomas difusos y de bordes tenues presentan límites inciertos; algunas máscaras de origen siguen estructuras no tumorales.
- No alcanza los objetivos declarados de 95 % de adherencia y 90 % de robustez (75,9 % en robustez).
- Es un adaptador MLX: no carga en transformers ni en peft, lo que limita su portabilidad a ecosistemas PyTorch.
- El adaptador no clasifica el tumor ni aporta información diagnóstica; cualquier uso que exija esa salida queda fuera de su alcance.
- Riesgo de alucinación y de sesgo: no cuantificado en la información disponible; la evaluación se limita a IoU y validez de formato.
- Restricciones de licencia: Apache 2.0 permite uso comercial del artefacto, pero el uso previsto y la validación son de investigación; el dataset de origen es CC BY 4.0 y exige atribución.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tbaumgauntlet/parallax-brain-loc-n512
- Checkpoint seleccionado: https://huggingface.co/tbaumgauntlet/parallax-brain-loc-n1024
- Modelo base: https://huggingface.co/mlx-community/Qwen3-VL-2B-Instruct-4bit
- Dataset de origen: doi:10.6084/m9.figshare.1512427.v8
- Cheng et al., PLoS ONE 10(10), 2015: "Enhanced Performance of Brain Tumor Classification via Tumor Region Augmentation and Partition"
- Cheng et al., PLoS ONE 11(6), 2016: "Retrieval of Brain Tumors by Adaptive Spatial Pooling and Fisher Vector Representation"
- Repositorio Parallax y MLX-VLM 0.7.11: no disponible (no se proporciona URL en la información recibida)
