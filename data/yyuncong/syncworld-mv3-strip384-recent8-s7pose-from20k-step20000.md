# yyuncong/SyncWorld-mv3-strip384-recent8-s7pose-from20k-step20000

## Resumen

SyncWorld-mv3-strip384-recent8-s7pose-from20k-step20000 es un checkpoint final de un modelo del mundo (world model) orientado a robótica, desarrollado por el usuario yyuncong dentro del proyecto SyncWorld. El modelo aborda el problema de la dinámica directa (forward dynamics): dado un fotograma ancla y una secuencia de acciones del efector final, predice los 16 fotogramas futuros correspondientes. Se trata de un modelo de difusión vídeo generativo con arquitectura transformer de atención completa y condicionamiento en contexto (in-context), sin memoria TTT.

El checkpoint se presenta como la línea base de la tercera ronda de tres cámaras de SyncWorld-dev, en su variante de acciones de pose (pose-action). Los pesos derivan, solo en pesos, del checkpoint update-20000 de la segunda ronda (recent8 v2), sobre el que se aplica un reentrenamiento con mezcla de datos PEWM s7. El repositorio ocupa 30,3 GB y se distribuye bajo licencia openmdw-1.1.

Resulta relevante para investigadores en robótica y modelos generativos porque combina predicción multi-vista (dos cámaras en tercera persona más cámara de muñeca), acciones de pose reales del efector final (no comandos) y condicionamiento por chunks históricos, lo que permite evaluar hasta qué punto un world model puede anticipar la evolución visual de una manipulación robótica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión vídeo con atención completa (full-attention), condicionamiento in-context, sin memoria TTT |
| Parametros totales | no disponible |
| Parametros activos | no disponible (incluye modulo `moe_gen`, sin cifras publicadas) |
| Longitud de contexto | 1 fotograma ancla + 16 acciones futuras + K chunks de 16 transiciones previas (K uniforme 1..8) |
| Tipos de cuantizacion | no disponible (entrenado en bf16 con pesos maestros fp32) |
| Idiomas soportados | no disponible (modelo no linguistico; salida visual y de acciones) |
| Licencia | openmdw-1.1 (license: other) |
| Formato de pesos | no disponible (repo de 30,3 GB; no se especifica safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo es un transformer generativo de vídeo entrenado con flow matching sobre fotogramas organizados en tiras (strips) de 1536x384, compuestas por tres celdas de 512x384: dos cámaras en tercera persona (intercambiadas por stream) y la cámara de muñeca en la última celda. Cada consulta (query) consiste en un fotograma ancla más 16 acciones futuras del efector final, y el modelo genera los 16 fotogramas siguientes. Como condicionamiento limpio se anteponen K chunks de 16 transiciones de la propia grabación que terminan justo antes del ancla, con K uniforme entre 1 y 8 y limitado al prefijo disponible. No hay recuperación (retrieval), biblioteca de contextos ni embedding aprendido de distancia al ancla.

Las acciones son deltas de pose reales del efector final (no comandos): por paso [dx, dy, dz cm, roll, pitch, yaw euler-xyz deg, gripper open], calculados como T_t^-1 T_t+1 de las matrices del gripper en `pose.pkl`, con la columna del gripper a 1 cuando `gripper_open` supera 0,6. Se aplica un relabel de ejes por stream (permutación con signo de determinante +1 y escala de traslación en [0,7, 1,5]). La pérdida es flow-matching de vídeo con el 80 % de los streams en ventana de alto ruido (t en [950, 1000]) y pesos de movimiento por celda de cámara.

El entrenamiento parte solo de pesos de recent8 v2 en update 20000, con optimizador, schedule y streams nuevos. Se usa AdamW (betas 0,9/0,99, weight decay 0,05), LR 5e-5 tras warm-up lineal de 100 updates, bf16 con pesos maestros fp32 y checkpointing completo de activaciones. Se entrenan `moe_gen`, el embedder temporal, las proyecciones VAE/acción y el embedding de modalidad de acción. La escala fue de 4 nodos x 8 H100 (HSDP con grupo FSDP de 8 vías por nodo y 4 réplicas), 1 stream por GPU (32 streams por update), durante 20 000 updates con checkpoint cada 1000. Los datos (preparación `syncworld_ttt/data/mv_strip_v4s7`) suman 481 574 grabaciones con las tres cámaras, incluyendo robocasa_v2 (50 543), robomimic_v2 (108 755) y otras fuentes, con cuotas por bucket (ic5 0,1878, col 0,1457, ic4 0,0861, ic 0,0843, robocasa+robomimic 0,2147, DROID 0,1815, RLBench 0,10).

## Capacidades

- Predicción de dinámica directa: genera 16 fotogramas futuros a partir de un ancla y 16 acciones de pose del efector final.
- Modelado multi-vista: produce simultáneamente las vistas de dos cámaras en tercera persona y la cámara de muñeca.
- Condicionamiento in-context: utiliza hasta 8 chunks de 16 transiciones previas de la propia grabación como contexto limpio.
- Acciones de pose reales del efector final (deltas SE(3) más apertura/cierre del gripper), no comandos abstractos.
- Generación vídeo por flow matching con pesos de movimiento por celda de cámara.
- Robustez a aumentación: dropout de vistas por stream (una cámara 10 %, dos 5 %) y recortes verticales aleatorios.
- No dispone de tool calling, function calling, capacidades de agente, multilingües, audio ni thinking mode (no es un modelo de lenguaje).

## Casos de uso

- Evaluación de world models en manipulación robótica: permite medir la capacidad de anticipar la evolución visual de una escena dada una secuencia de poses del efector final, usando las tres vistas como señal de comparación.
- Planificación por imaginería (imagination-based planning): simular varios rollouts de acciones candidatas y comparar los fotogramas predichos con el objetivo para seleccionar la trayectoria del efector final.
- Aumentación de datos sintéticos: generar fotogramas futuros plausibles para aumentar datasets de robocasa, robomimic o DROID con pares (observación, acción, resultado).
- Preentrenamiento de políticas robóticas: usar las representaciones o los rollouts generados como entorno auxiliar para entrenar políticas con recompensa basada en predicción.
- Análisis de agarre (grasping): al condicionar con la columna de apertura del gripper y chunks previos, permite estudiar la predicción del cierre del gripper y su efecto visual en la cámara de muñeca.
- Investigación en condicionamiento in-context: comparar esta línea base (sin retrieval) con las variantes mvSV3p y de comandos para aislar el efecto del método de selección de contexto.
- Estudio de robustez multi-cámara: evaluar cómo el dropout de vistas y los recortes afectan la consistencia entre las tres cámaras en escenarios de oclusión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repo de pesos ocupa 30,3 GB, lo que sugiere un requisito mínimo en torno a esa cifra en bf16, pero no se confirma.
- GPU recomendadas: el entrenamiento se realizó en 4 nodos x 8 H100 (80 GB) y la variante mvSV3p en 4 nodos x 8 B200; para inferencia se espera que H100/A100 de 80 GB sean adecuadas, sin datos confirmados.
- Cabe en GPU de consumo: no confirmado; por el tamaño del repo (30,3 GB) no cabe en GPUs de 24 GB sin cuantización, y no se documentan formatos cuantizados.
- Opciones de despliegue: no disponible; no se mencionan vLLM, llama.cpp, Ollama ni TGI (son herramientas de LLM, no aplicables directamente a este modelo de difusión vídeo).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SyncWorld-mv3-strip384-recent8-s7pose (este) | no disponible | ancla + 16 acciones + K chunks (K 1..8) | no disponible | openmdw-1.1 | Hugging Face, 0 descargas |
| SyncWorld-mv3-strip384-views-first-s7pose (mvSV3p) | no disponible | igual, con retrieval y embedding distancia-ancla | no disponible | openmdw-1.1 (presumible) | Hugging Face |
| SyncWorld-mv3-strip384-recent8-s7cmd | no disponible | igual, con acciones de comando | no disponible | openmdw-1.1 (presumible) | Hugging Face |
| SyncWorld-mv3-strip384 (mvSV3) | no disponible | igual, retrieval + comandos | no disponible | openmdw-1.1 (presumible) | Hugging Face |

Las tres variantes comparten inicialización (recent8 v2 en update 20000) y difieren solo en el método de selección de contexto (retrieval frente a chunks propios) y en el tipo de acción (pose realizada frente a comando). No se dispone de cifras de rendimiento comparativas.

## Limitaciones y advertencias

- Modelo especializado en robótica y predicción vídeo; no es un modelo de lenguaje y no ofrece generación de texto, código ni matemáticas.
- Riesgo de alucinación visual: al ser un modelo generativo de difusión, los fotogramas predichos pueden divergir de la física real, especialmente en contactos, oclusiones y objetos deformables.
- Horizonte limitado: predice solo 16 fotogramas futuros por consulta; el contexto previo se limita a K chunks (máximo 8) de 16 transiciones.
- Dependencia de la cámara de muñeca y de la pose del gripper: la señal de apertura se binariza con umbral 0,6 sobre `gripper_open`, lo que puede perder matices de agarre parcial.
- Filtros anti-fuga: se excluyeron ventanas de evaluación (5,4 % de la masa) y ventanas DROID con fuga del resultado del agarre tienen peso reducido a la mitad; esto puede introducir sesgo en la distribución efectiva.
- Licencia openmdw-1.1 (license: other): deben revisarse los términos en el enlace de NVIDIA Cosmos antes de uso comercial; no se garantiza permiso comercial explícito en la información disponible.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de validación comunitaria ni de reproducibilidad por terceros.
- No se especifican formatos de pesos ni scripts de inferencia; el despliegue en producción requeriría trabajo adicional no documentado.

## Enlaces

- Hugging Face: https://huggingface.co/yyuncong/SyncWorld-mv3-strip384-recent8-s7pose-from20k-step20000
- Variante mvSV3p (retrieval, pose): https://huggingface.co/yyuncong/SyncWorld-mv3-strip384-views-first-s7pose-from20k-step20000
- Variante recent8 con comandos: https://huggingface.co/yyuncong/SyncWorld-mv3-strip384-recent8-s7cmd-from20k-step20000
- Licencia openmdw-1.1 (NVIDIA Cosmos): https://github.com/NVIDIA/Cosmos/blob/main/LICENSE
