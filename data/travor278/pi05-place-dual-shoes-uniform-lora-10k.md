# Travor278/pi05-place-dual-shoes-uniform-lora-10k

## Resumen

`Travor278/pi05-place-dual-shoes-uniform-lora-10k` es un adaptador LoRA entrenado sobre el modelo base pi0.5 de Physical Intelligence en su implementación JAX dentro de OpenPI. Se trata de una política visión-lenguaje-acción (VLA) para robótica: recibe tres vistas RGB de 224x224 píxeles más el estado del robot en 14 dimensiones y emite acciones continuas en el mismo espacio de 14 dimensiones, con un horizonte de predicción de 50 pasos y una frecuencia de 25 FPS. La tarea está condicionada por un único prompt en inglés: "Put both shoes in the shoe box".

El modelo se ha afinado sobre el conjunto de datos `Shiki42/ctr-place-dual-shoes-uniform-20260911`, compuesto por 100 episodios y 46.955 fotogramas a 25 FPS. La receta es deliberadamente mínima: LoRA con rango/alpha 16 en el backbone PaliGemma y rango 32 en el experto de acción, sin conversiones de unidades delta/Aloha ni máscara de inactividad. El entrenamiento se realizó en 2 GPU H100 de 80 GB con batch global de 16 durante 10.000 actualizaciones.

Su relevancia es doble: por un lado, sirve como ejemplo reproducible de adaptación de bajo coste de un VLA sobre un único conjunto de datos propio; por otro, el autor documenta de forma exhaustiva el pipeline (hashes de arrays decodificados, manifiestos de ficheros, configuración resuelta, parches de compatibilidad con Orbax). Conviene subrayar que el propio autor declara explícitamente que no se hace ninguna afirmación sobre tasa de éxito en rollout en bucle cerrado, por lo que el checkpoint debe tratarse como un artefacto de entrenamiento verificado, no como una política validada en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer visión-lenguaje-acción (VLA) pi0.5 sobre openpi JAX; backbone PaliGemma + experto de acción único estándar, con adaptadores LoRA |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible; horizonte de acción de 50 pasos y 3 vistas RGB a 224x224 |
| Tipos de cuantizacion | no disponible; el entrenamiento usa bf16 en activaciones y pesos congelados y float32 en pesos entrenables |
| Idiomas soportados | no disponible; el condicionamiento de lenguaje se limita al prompt fijo en inglés "Put both shoes in the shoe box." |
| Licencia | no disponible |
| Formato de pesos | Orbax (JAX), checkpoint compatible con OpenPI; incluye pesos base, pesos LoRA y activos de normalización. No se publican safetensors ni GGUF |
| Dimension de estado/acciones | 14 nativas (absolutas), rellenadas (padding) hasta 32 |
| Frecuencia de control | 25 FPS |
| Adaptadores LoRA | rango/alpha 16 en PaliGemma; rango 32 en el experto de acción |
| Tamano del repositorio | 6,3 GB |
| Checkpoint de inferencia | `10000/` como raíz de checkpoint Orbax; el estado del optimizador permanece en la plataforma de entrenamiento |

## Arquitectura y entrenamiento

La arquitectura sigue el diseño pi0.5 en su variante JAX de OpenPI: un backbone vision-lenguaje (PaliGemma) que procesa las tres vistas RGB a 224x224 junto con el prompt textual, y un experto de acción único que genera la secuencia de acciones. Las tres vistas RGB se mapean mediante el `training_config.py` adjunto y se redimensionan a 224x224; el estado y las acciones nativas de 14 dimensiones se rellenan hasta 32, con un horizonte de 50 pasos. El ajuste se aplica como LoRA de bajo rango sobre el modelo base `XinY0201/openpi-pi05-base-jax@5e62884fcf8cb8f9fc693c9163ea18d3e3739658`, con rango/alpha 16 en PaliGemma y rango 32 en el experto de acción, y con un filtro de congelación de referencia que deja entrenables visión y proyecciones.

La receta de entrenamiento está documentada con detalle: 2 GPU H100 de 80 GB, batch global 16, semilla 87431, 10.000 actualizaciones, AdamW con beta1 0,9, beta2 0,95, epsilon 1e-8, weight decay 1e-10 y clipping 1, sin EMA. Se emplea una curva coseno fijada a 30k pasos con 1000 de warmup, pico de 2,5e-5 y valor final de 2,5e-6, deteniendo el entrenamiento en el paso 10.000. Los datos de entrenamiento son 100 episodios y 46.955 fotogramas a 25 FPS del conjunto `Shiki42/ctr-place-dual-shoes-uniform-20260911@32f25a495d0cab93307a1c9d73010501a049f1e6`, sin conversión de unidades delta/Aloha y sin máscara de inactividad (idle mask). El autor indica que se verificaron estadísticas de dataset independientes y comprobaciones reales de lector y tokenizador antes de asignar GPU, que todos los arrays de parámetros y del optimizador se restauran estrictamente y se comprueban como finitos, y que se registran hashes de los arrays decodificados. El entorno de plataforma es el contenedor NGC PyTorch 25.02 ejecutando un entorno JAX construido aparte, y el autor advierte que no se reclama identidad byte a byte con el runtime archivado histórico de CTR.

## Capacidades

- Generación de acciones robóticas continuas en un espacio de 14 dimensiones, condicionadas por tres vistas RGB y el estado del robot, a 25 FPS.
- Ejecución de una tarea de manipulación concreta y única: colocar dos zapatos en una caja de zapatos ("place dual shoes").
- Condicionamiento por lenguaje, limitado al prompt de entrenamiento en inglés; no se documenta generalización a otras instrucciones.
- Percepción visual multi-vista: tres cámaras RGB nativas procesadas simultáneamente a 224x224.
- Predicción con horizonte de 50 pasos, apta para control por re-planificación en bucle cerrado (si bien no se aporta evidencia de éxito en bucle cerrado).
- Punto de partida para ajuste adicional: al ser un adaptador LoRA sobre un base JAX congelado, es reutilizable como inicialización para tareas relacionadas.
- Reproducibilidad y auditoría: incluye configuración resuelta, manifiestos, parches de compatibilidad, historial de trabajos y verificación del paso de optimizador 10.000.
- No dispone de tool calling, function calling, orquestación de agentes, razonamiento multi-paso textual, generación de código, matemáticas ni capacidades de audio. No es un modelo de chat ni de generación de lenguaje.

## Casos de uso

- Automatización de empaquetado en línea: la política puede integrarse en una celda robotizada que recoja calzado y lo deposite en una caja, empleando las tres vistas RGB como entrada de percepción y emitiendo comandos a 25 FPS con horizonte de 50 pasos.
- Punto de partida para fine-tuning de tareas de colocación (pick-and-place): el adaptador LoRA puede recargarse y reentrenarse sobre nuevos conjuntos de episodios con el mismo formato de estado/acción de 14 dimensiones, reduciendo el coste frente a partir del base sin adaptar.
- Investigación en adaptación eficiente de VLA: permite comparar experimentalmente configuraciones de LoRA (rango/alpha 16 en el backbone, 32 en el experto de acción) frente a ajuste completo o a otros rangos, con un presupuesto de cómputo de 2 GPU H100 y 10.000 pasos.
- Evaluación de la pila OpenPI en JAX: sirve como checkpoint de prueba para validar integraciones de inferencia, carga de Orbax, normalización de estado/acciones y mapeo de cámaras antes de desplegar modelos mayores.
- Generación de rollouts para aumento de datos: en bucle abierto puede emplearse para producir trayectorias sintéticas que luego se filtren y se añadan a conjuntos de entrenamiento de políticas posteriores.
- Reproducción y auditoría de experimentos: dado que el repositorio incluye `10000/experiment/` con versiones de paquetes, configuración resuelta, hashes y parches contra el upstream fijado, es útil como caso de estudio de trazabilidad en entrenamientos de robótica.
- Validación de cadenas de datos personalizadas: el hecho de que no aplique conversión delta/Aloha ni máscara de inactividad lo convierte en un buen banco de pruebas para pipelines propios de estado y acción absolutos de 14 dimensiones con padding a 32.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor declara de forma explícita que no se realiza ninguna afirmación sobre tasa de éxito en rollout en bucle cerrado ("No closed-loop rollout success-rate claim is made"), y la model card no incluye métricas tipo MMLU, HumanEval, GSM8K ni tasas de éxito en simulación o en robot real.

| Benchmark | Resultado |
|---|---|
| Rendimiento en bucle cerrado | no disponible (no reclamado por el autor) |
| Métricas de dataset de validación | no disponible |

## Requisitos de hardware

- Entrenamiento documentado: 2 GPU H100 de 80 GB, contenedor NGC PyTorch 25.02 con un entorno JAX construido aparte.
- VRAM para inferencia: no disponible; la model card no especifica requisitos de inferencia y no se publican cuantizaciones.
- GPU recomendadas: no especificadas por el autor; por el tamaño del repositorio (6,3 GB) el checkpoint es manejable en disco, pero la huella en VRAM depende del backbone base y debe medirse en el entorno objetivo.
- Compatibilidad con GPU de consumo: no confirmada; no hay datos publicados al respecto.
- Opciones de despliegue: pila OpenPI con JAX y checkpoints Orbax (raíz `10000/`). No aplican vLLM, llama.cpp, Ollama ni TGI, ya que el modelo no se distribuye en safetensors ni GGUF y no es un modelo de lenguaje generativo.
- Latencia y throughput: no disponibles; la tasa de control objetivo del conjunto de datos es de 25 FPS, pero no se documenta el rendimiento real de inferencia.
- Estado del optimizador: no se incluye en el repositorio, por lo que reanudar el entrenamiento exactamente desde el paso 10.000 requeriría regenerarlo o continuar desde los pesos publicados.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto/horizonte | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Travor278/pi05-place-dual-shoes-uniform-lora-10k` | LoRA sobre pi0.5 (JAX) | no disponible | horizonte 50; estado/acción 14 (padding 32) | no disponible | HuggingFace, 6,3 GB, 0 descargas, 0 likes |
| `XinY0201/openpi-pi05-base-jax` | Modelo base pi0.5 (JAX) | no disponible | no disponible | no disponible | HuggingFace (base sobre la que se entrena este LoRA) |
| pi0 (OpenPI, Physical Intelligence) | VLA predecesor de pi0.5 | no disponible | no disponible | no disponible | Repositorio openpi |
| OpenVLA-7B | VLA de propósito general | 7B (aproximado, dato externo) | no disponible | no disponible | HuggingFace |

No se dispone de métricas comparativas publicadas entre estos modelos en la información proporcionada, por lo que la comparación se limita a tipo de artefacto, formato y disponibilidad.

## Limitaciones y advertencias

- Licencia no declarada: no se especifica licencia en la model card ni en los metadatos de HuggingFace, lo que impide determinar si el uso comercial está permitido. Cualquier despliegue en producción debería aclarar este punto con el autor.
- Sin validación en bucle cerrado: el autor no reclama ninguna tasa de éxito en robot real ni en simulación; el artefacto verificado es el entrenamiento, no el rendimiento de la política.
- Política de tarea única: el condicionamiento está limitado al prompt "Put both shoes in the shoe box". No hay evidencia de generalización a otras instrucciones, objetos o disposiciones.
- Dataset reducido y homogéneo: 100 episodios y 46.955 fotogramas de una única configuración, lo que aumenta el riesgo de sobreajuste al entorno, iluminación, cámara, caja y tipo de calzado concretos.
- Formato de despliegue restrictivo: solo Orbax/JAX dentro de OpenPI. No hay safetensors, GGUF ni cuantizaciones publicadas, lo que complica la integración con ecosistemas de inferencia convencionales.
- Dependencia del base: el repositorio no contiene el estado del optimizador y requiere el modelo base JAX fijado para reconstruir el árbol completo de parámetros de inferencia.
- Idiomas: el prompt de entrenamiento está en inglés y no se documentan capacidades multilingües.
- Riesgo físico: en aplicaciones robóticas, los fallos de la política pueden provocar colisiones, daños en objetos o incidentes de seguridad; se requiere supervisión humana, paradas de emergencia y validación en el entorno real antes de cualquier uso autónomo.
- Metadatos atípicos: la fecha de creación registrada es 2026-09-12, posterior a la fecha actual habitual de consulta; conviene verificar la vigencia y procedencia del repositorio antes de reutilizarlo.
- Sin tracción comunitaria: 0 descargas y 0 likes, por lo que no existe retroalimentación externa ni validación independiente.
- La búsqueda web realizada no arrojó resultados relevantes sobre este modelo; todas las fuentes devueltas eran ajenas al ámbito de la robótica o de los modelos fundacionales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Travor278/pi05-place-dual-shoes-uniform-lora-10k
- Modelo base citado en la model card: `XinY0201/openpi-pi05-base-jax` (commit 5e62884fcf8cb8f9fc693c9163ea18d3e3739658)
- Conjunto de datos citado: `Shiki42/ctr-place-dual-shoes-uniform-20260911` (commit 32f25a495d0cab93307a1c9d73010501a049f1e6)
- Librería declarada: openpi (pipeline `robotics`, etiquetas `openpi`, `pi05`, `jax`, `lora`)
- Resultados de la búsqueda web: sin resultados relevantes sobre este modelo; los enlaces devueltos (foros de diabetes, Foursquare) no guardan relación con el artefacto.
