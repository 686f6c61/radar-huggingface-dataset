# yyuncong/SyncWorld-mv3-strip384-views-first-selv2-c7rhpose-from20k-step8000

## Resumen

SyncWorld es un modelo de mundo (world model) orientado a robótica que predice la dinámica futura de una escena a partir de observaciones multivista y acciones de efector final. Este checkpoint concreto, `SyncWorld-mv3-strip384-views-first-selv2-c7rhpose-from20k-step8000`, es una iteración intermedia (actualización 8000 de 20320) de un entrenamiento en curso, desarrollado por el usuario de Hugging Face `yyuncong`. El modelo parte de los pesos de `mvSV3p` en la actualización 20000 y se entrena sobre una mezcla de ventanas denominada C7RH+.

La innovación principal de esta variante es el uso de un "selector de contexto v2" aprendido: un scorer lineal que elige qué fragmentos de una biblioteca de recuperación ocupan las ranuras de contexto en cada consulta. Esto sustituye a una selección con pesos fijos e iguales, que es la que emplea el checkpoint de control del mismo autor. El modelo está pensado para condicionamiento en contexto (in-context) con hasta 8 fragmentos, lo que permite adaptar la predicción a la escena y la tarea sin reentrenar.

Por su naturaleza, no es un modelo de lenguaje: no genera texto ni código, sino que modela la evolución de escenas robóticas multi-cámara. Su relevancia radica en el enfoque de recuperación aprendida para world models de robótica, un área activa de investigación. El repositorio ocupa 30,4 GB y los pesos se distribuyen en formato de checkpoint DCP convertido a bf16, no en safetensors ni GGUF estándar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | World model para robótica (forward dynamics), condicionado en contexto con recuperación multivista; detalles internos no disponibles |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | Hasta 8 fragmentos (K uniforme en 1..8) de contexto recuperado; longitud en tokens no disponible |
| Tipos de cuantización | no disponible (checkpoint en bf16) |
| Idiomas soportados | no disponible (modelo no lingüístico) |
| Licencia | openmdw-1.1 (referenciada como `other` en la model card) |
| Formato de pesos | Checkpoint DCP del entrenador convertido a bf16; `config.pkl` y `router.npz` |

## Arquitectura y entrenamiento

El modelo es un world model de dinámica directa (forward dynamics) que opera sobre secuencias multivista con una cámara "strip384" y condicionamiento por acciones de pose del efector final realizadas. La arquitectura interna no se detalla en la información disponible; lo que sí se especifica es el mecanismo de contexto: para cada consulta se toma el fragmento de la propia grabación inmediatamente anterior al ancla y K-1 fragmentos adicionales seleccionados por el selector, con K uniforme entre 1 y 8. Los fotogramas, el layout y la función de pérdida siguen el esquema de `mvSV3p`.

El entrenamiento parte solo de pesos (sin estado del optimizador) de `mvSV3p` en la actualización 20000 y se ejecuta sobre la mezcla C7RH+, compuesta por ventanas DROID de C7RH y ventanas simuladas s7 a las proporciones de C7RH multiplicadas por 0,8, más RLBench y DROID sin etiquetar al 0,10 cada uno. El selector v2 es un scorer lineal sobre 15 características por fragmento (7 similitudes con la consulta —acción, pose, imagen, muñeca—, indicador de grabación propia, log-gap al ancla, pertenencia a regla, rango de regla negado y rango de pool, y relaciones de hermano de episodio, misma sesión y misma tarea), con score = ((x - v2_mean) / v2_scale) · v2_theta. Se reajusta durante el entrenamiento: 8 de cada 508 iteraciones son de etiquetado, midiendo la pérdida del generador con 8 fragmentos candidatos y con subconjuntos aleatorios de estos; mínimos cuadrados no negativos convierten esas pérdidas en valores por fragmento que alimentan un pool persistente de 4000 consultas, y un ajuste logístico por pares ponderado por valor produce la siguiente versión del scorer. La versión 0 se ajustó sobre un pool semilla de 1813 consultas de sondeo. El recuento de iteraciones incluye las de etiquetado: la iteración 8000 corresponde a unas 7874 actualizaciones del generador, y la ejecución termina en la iteración 20320 (20000 actualizaciones). El entrenamiento se lanzó en 4 nodos de 8 H100 (32 GPU) con el launcher `wm_ttt/handoff/selector_v2_launch.sh` y el config `training/config.yaml`.

## Capacidades

- Predicción de dinámica futura de escenas robóticas multivista condicionada por acciones de pose del efector final.
- Condicionamiento en contexto mediante recuperación: selecciona fragmentos de una biblioteca para adaptar la predicción a la consulta.
- Selección aprendida de contexto con el scorer v2, que elige los fragmentos más informativos para cada consulta.
- Manejo de K variable (1 a 8 fragmentos), con mayor impacto del selector en K pequeños (2 a 4).
- Modelado de escenas con múltiples cámaras, incluida una vista de muñeca (wrist).
- No soporta generación de texto, código, tool calling, agentes ni capacidades multilingües; no es un modelo lingüístico.
- Capacidades de visión: procesa imágenes multivista como entrada, pero no se documentan tareas de visión general (VQA, captioning, etc.).

## Casos de uso

- Predicción de trayectorias en manipulación robótica: dado un historial de observaciones multivista y una secuencia de acciones de pose, el modelo estima la evolución de la escena, útil para planificación y control predictivo.
- Evaluación de políticas en simulación: al modelar la dinámica directa, puede usarse como sustituto barato del simulador para estimar el resultado de acciones candidatas antes de ejecutarlas.
- Aprendizaje por refuerzo basado en modelo: el world model proporciona transiciones aprendidas que alimentan un planificador o un agente de RL, reduciendo la necesidad de interacción real.
- Investigación en recuperación de contexto para world models: el selector v2 y su protocolo de etiquetado permiten estudiar cómo la selección de fragmentos afecta a la calidad de la predicción.
- Adaptación a nuevas escenas sin reentrenar: gracias al condicionamiento en contexto con fragmentos recuperados de la biblioteca, el modelo puede ajustarse a una escena o tarea nueva con ejemplos relevantes.
- Benchmarking de métodos de selección de contexto: comparar el selector aprendido con el control de pesos iguales (`equalw-c7rhpose-from-s384-47k-step8000`) en las mismas condiciones de datos, acciones, biblioteca y K.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta la pérdida de entrenamiento (`train@2/loss`, media sobre las 500 iteraciones previas a cada marca):

| Actualización | 1000 | 2000 | 4000 | 8000 |
|---|---|---|---|---|
| Loss | 0,0755 | 0,0749 | 0,0735 | 0,0728 |

## Requisitos de hardware

- Entrenamiento: 4 nodos de 8 GPU H100 (32 GPU en total), según el launcher indicado en la model card.
- VRAM para inferencia: no disponible; el tamaño del repositorio es de 30,4 GB, lo que da una cota inferior aproximada del peso de los checkpoints, pero no se especifica el consumo en ejecución.
- GPU recomendadas: no disponible para inferencia; el entrenamiento se realizó en H100.
- ¿Cabe en GPU de consumo? No disponible. Con 30,4 GB de repositorio, un despliegue en GPU de consumo requeriría cuantización, y no se documentan formatos cuantizados.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; el modelo usa el stack de entrenamiento propio del autor (`wm_ttt`, `training/config.yaml`, `config.pkl`).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| SyncWorld-mv3-strip384-views-first-selv2-c7rhpose-from20k-step8000 (este) | no disponible | K = 1..8 fragmentos | openmdw-1.1 | Hugging Face, checkpoint intermedio |
| SyncWorld-mv3-strip384-views-first-equalw-c7rhpose-from-s384-47k-step8000 (control del mismo autor) | no disponible | K = 1..8 fragmentos | openmdw-1.1 | Hugging Face; mismos datos, acciones, biblioteca y K, pero inicialización distinta y pesos fijos iguales |
| SyncWorld-mv3-strip384-views-first-s7pose-from20k-step20000 (modelo base del que parte) | no disponible | no disponible | openmdw-1.1 | Hugging Face; pesos de partida de este entrenamiento |

No se dispone de información sobre otros world models de robótica comparables en la documentación proporcionada.

## Limitaciones y advertencias

- Checkpoint intermedio: corresponde a la actualización 8000 de 20320; no es un modelo final y su rendimiento puede mejorar con el entrenamiento restante.
- El modelo solo cambia qué fragmentos ocupan las ranuras de contexto; su efecto es mayor con K pequeños (2 a 4) y puede ser marginal con K grandes.
- Para evaluar el método del selector hay que usar `router.npz`; `config.pkl` por sí solo reconstruye únicamente la versión 0 del scorer.
- El recuento de iteraciones incluye las de etiquetado, por lo que la iteración 8000 equivale a unas 7874 actualizaciones reales del generador.
- No es un modelo de lenguaje: no admite prompts en lenguaje natural, tool calling ni generación de texto; su uso indebido en esos escenarios no está soportado.
- Sesgos conocidos: no disponibles; al entrenarse con mezclas de DROID, RLBench y datos simulados, puede heredar sesgos de esos conjuntos.
- Riesgo de alucinación: no disponible; en un world model se traduciría en predicciones de dinámica incorrectas, especialmente fuera de la distribución de entrenamiento.
- Licencia openmdw-1.1 (referenciada como `other`): conviene revisar los términos en el enlace de licencia de NVIDIA Cosmos antes de un uso comercial.
- No se documentan idiomas, cuantizaciones ni formatos de despliegue estándar, lo que dificulta su integración en pipelines convencionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yyuncong/SyncWorld-mv3-strip384-views-first-selv2-c7rhpose-from20k-step8000
- Modelo base (mvSV3p, update 20000): https://huggingface.co/yyuncong/SyncWorld-mv3-strip384-views-first-s7pose-from20k-step20000
- Checkpoint de control con pesos iguales: https://huggingface.co/yyuncong/SyncWorld-mv3-strip384-views-first-equalw-c7rhpose-from-s384-47k-step8000
- Licencia openmdw-1.1 (NVIDIA Cosmos): https://github.com/NVIDIA/Cosmos/blob/main/LICENSE
