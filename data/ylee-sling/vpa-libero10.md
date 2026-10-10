# ylee-sling/vpa-libero10

## Resumen

VPA (Vision-Predictor-Action) es una implementación de referencia de robótica embodied que sustituye el decodificador autoregresivo de los modelos visión-lenguaje-acción (VLA) por un bucle de control latente. Estos checkpoints concretos (`vpa-libero10`) son los pesos entrenados para el conjunto de tareas LIBERO-10 y los publica el autor Yeonseok Lee bajo el identificador `ylee-sling`. El modelo se describe en el preprint *Vision-Predictor-Action: Towards Efficient Embodied AI via Neuro-Symbolic JEPA Predictors* (DOI 10.5281/zenodo.22960919).

La arquitectura encadena un codificador visual compartido, un selector neuro-simbólico de primitivas, un predictor JEPA del siguiente estado latente y un solucionador de flow matching que genera un bloque completo de acciones en K pasos. El resultado es que un paso de decisión requiere K + 3 evaluaciones de red secuenciales, con independencia de la longitud del bloque de acciones. Se publican dos variantes idénticas en entrenamiento que solo difieren en el número de cámaras: una con vista de terceros y otra que añade la muñeca.

Es relevante ahora porque propone una alternativa al cuello de botella de inferencia de los VLA autoregresivos en robótica de manipulación, y porque publica resultados preliminares medibles (40,0 % de éxito con dos cámaras en LIBERO-10) junto con código, configuración y pesos listos para reproducir.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VPA (Vision-Predictor-Action): codificador visual ViT, selector neuro-simbólico de primitivas, predictor JEPA del siguiente latente y solucionador de flow matching. Sustituye el decodificador autoregresivo de un VLA |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje con ventana de contexto) |
| Tipos de cuantizacion | no disponible (solo se publican pesos `.pt` y `.safetensors` sin cuantizar) |
| Idiomas soportados | no disponible. La condicion textual se codifica con el encoder CLIP congelado `openai/clip-vit-base-patch32` |
| Licencia | GPL-3.0-only |
| Formato de pesos | PyTorch (`.pt`) y safetensors (`.safetensors`), con JSON de configuración (`VPAConfig`) |

## Arquitectura y entrenamiento

El modelo abandona el decodificador tipo LLM propio de los VLA y lo reemplaza por un bucle de control latente. Un codificador visual compartido (E_ψ) procesa los fotogramas; un selector neuro-simbólico de primitivas decide la primitiva; un predictor JEPA estima el siguiente estado latente y un solucionador de flow matching genera el bloque de acciones en K pasos. La clave de eficiencia es que un paso de decisión consume K + 3 evaluaciones de red secuenciales, sin que el coste crezca con la longitud del bloque de acciones (H). La condicion textual se obtiene de un encoder CLIP de texto congelado (`openai/clip-vit-base-patch32`), que se descarga en la primera carga.

El entrenamiento se realizó sobre las demostraciones de LIBERO-10 con una configuración fija: encoder ViT inicializado aleatoriamente, fotogramas de 128×128, 50.000 + 50.000 pasos, batch de 64, K = 2, H = 16 y semilla 0. Las dos variantes (una y dos cámaras) se entrenaron de forma idéntica, cambiando únicamente las cámaras de entrada: la variante de una cámara usa `agentview_rgb` (el marco de observación único del artículo) y la de dos cámaras añade `eye_in_hand_rgb`.

## Capacidades

- Generación de acciones robóticas en bloques (action chunking) mediante flow matching, con un coste de inferencia fijo de K + 3 evaluaciones por paso de decisión.
- Percepción visual a partir de una cámara (vista de terceros) o dos cámaras (vista de terceros y muñeca).
- Condicionamiento por lenguaje natural codificado con CLIP, para asociar instrucciones textuales con metas de la tarea.
- Selección de primitivas neuro-simbólicas dentro del bucle de control.
- Predicción del siguiente estado latente con un predictor JEPA.
- Evaluación en bucle cerrado (closed-loop) dentro del simulador LIBERO mediante `eval.py`.
- Interfaz de pipeline con `load_pipeline`, calibrada y lista para `reset`, `step` y `act`.
- Capacidades de visión-lenguaje-acción específicas de manipulación; no es un modelo de propósito general de texto, código, matemáticas ni visión de escenas abiertas.

## Casos de uso

- Investigación en manipulación robótica: reproducir el entrenamiento y la evaluación de VPA sobre LIBERO-10 con `train.py` y `eval.py`, usando la semilla y los hiperparámetros publicados para comparar variantes de cámara.
- Comparación de arquitecturas VLA: usar el bucle latente (JEPA + flow matching) como línea base frente a VLA autoregresivos en tareas de manipulación, midiendo coste por paso de decisión (K + 3 evaluaciones).
- Estudio del efecto de la percepción: medir la diferencia entre la variante de una cámara (10,5 %) y la de dos cámaras (40,0 %) para cuantificar la aportación de la cámara de muñeca en el bucle de control.
- Desarrollo de controladores latentes: reutilizar el predictor JEPA y el solucionador de flow matching como componentes independientes en prototipos de control robótico dentro del simulador.
- Ablaciones de horizonte de ejecución: emplear el barrido de horizonte de ejecución incluido en el repositorio para analizar cómo afecta la longitud del bloque de acciones al éxito de la tarea.
- Docencia e investigación en robótica embodied: servir como ejemplo ejecutable de pipeline visión-lenguaje-acción no autoregresivo sobre un benchmark reproducible (LIBERO-10).
- Pruebas comparativas reproducibles: repetir las 20 pruebas por tarea y 200 episodios por fila reportadas, para validar el intervalo del 95 % (±7 puntos) en distintos entornos de cómputo.

## Benchmarks y rendimiento

Resultados preliminares sobre LIBERO-10 (una ejecución de entrenamiento por modelo y 20 pruebas por tarea; 200 episodios por fila; intervalo del 95 % de aproximadamente ±7 puntos):

| Modelo | Exito | Intervalo del 95 % |
|---|---|---|
| Una camara (`agentview_rgb`) | 10,5 % (21/200) | 7,0–15,5 % |
| Dos camaras (`agentview_rgb` + `eye_in_hand_rgb`) | 40,0 % (80/200) | 33,5–46,9 % |

El autor indica que las tasas por tarea, el barrido del horizonte de ejecución y la prueba de privación visual (blindfold) están en el README del repositorio. No se publican otros benchmarks (MMLU, HumanEval, GSM8K u similares), que no aplican a este tipo de modelo.

## Requisitos de hardware

- Tamano del repositorio: 0,3 GB, lo que incluye los pesos `.pt` y `.safetensors` de las dos variantes y los JSON de configuración. Los pesos individuales son, por tanto, de decenas de MB.
- VRAM estimada para inferencia: no disponible de forma explícita; dado el tamano del repositorio y el hecho de que las evaluaciones usan fotogramas de 128×128, el modelo es pequeno y cabe con holgura en GPU de consumo.
- GPU recomendadas: no indicadas por el autor. Por tamano y resolución de entrada, es probable que funcione en GPU de consumo (por ejemplo, RTX 4090 u similares); no se confirma en la información disponible.
- Opciones de despliegue: la carga se realiza con la función `load_pipeline` del propio repositorio (PyTorch y CUDA). En la primera carga se descarga el encoder de texto CLIP congelado `openai/clip-vit-base-patch32`. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a este formato).
- Latencia y throughput: no disponibles. La única medida de coste publicada es el número de evaluaciones de red por paso de decisión (K + 3, con K = 2 por defecto).
- La evaluación en bucle cerrado requiere además el simulador LIBERO y sus dependencias (incluida `h5py` para los datasets).

## Comparativa con modelos similares

La model card no incluye una comparación directa con otros modelos VLA. El preprint posiciona a VPA como alternativa a los VLA con decodificador autoregresivo, pero no se aportan cifras comparativas de terceros en la información disponible.

| Modelo | Parametros | Contexto | Rendimiento en LIBERO-10 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| VPA (este modelo) | no disponible | no aplica | 40,0 % con dos camaras; 10,5 % con una camara | GPL-3.0-only | Pesos en HuggingFace y codigo en GitHub |
| VLA autoregresivos de referencia (p. ej. OpenVLA, Octo, RT-2) | no disponible | no disponible | no disponible | no disponible | no disponible |

Datos comparativos de modelos alternativos: no disponibles en la información proporcionada.

## Limitaciones y advertencias

- Resultados preliminares: una única ejecución de entrenamiento por modelo y 20 pruebas por tarea, con un intervalo del 95 % de ±7 puntos, lo que limita la significación estadística.
- Rendimiento bajo en la variante de una cámara (10,5 %), que refleja la dependencia de la cámara de muñeca para estas tareas.
- Es un checkpoint de investigación, no un sistema listo para producción: no se garantiza robustez fuera de las demostraciones de LIBERO-10.
- Entrenado exclusivamente sobre demostraciones de LIBERO (simulación); no hay evidencia de transferencia a hardware físico.
- Sin cuantizaciones publicadas y sin integración con runtimes de inferencia habituales (vLLM, llama.cpp, etc.).
- Riesgo de error del predictor latente: al estimar el siguiente estado con un predictor JEPA en lugar de con retroalimentación directa, los errores pueden acumularse a lo largo del bucle de control.
- Licencia GPL-3.0-only: es una licencia copyleft, con implicaciones para la integración en productos propietarios; conviene revisar su compatibilidad antes de cualquier uso comercial.
- Los términos de los datasets LIBERO se aplican adicionalmente a estos pesos.
- La condición textual depende del encoder CLIP congelado; no se detallan los idiomas soportados ni el comportamiento fuera de las instrucciones de LIBERO.
- Resolución de entrada fija de 128×128 y configuración fija (K = 2, H = 16) en los checkpoints publicados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ylee-sling/vpa-libero10
- Repositorio de código, entrenamiento y evaluación: https://github.com/ylee-sling/Vision-Predictor-Action
- Resultados detallados (README del repositorio): https://github.com/ylee-sling/Vision-Predictor-Action#results-on-libero-10-preliminary
- Preprint (DOI): https://doi.org/10.5281/zenodo.22960919
- Benchmarks LIBERO: https://github.com/Lifelong-Robot-Learning/LIBERO
- Encoder de texto CLIP congelado: `openai/clip-vit-base-patch32`
