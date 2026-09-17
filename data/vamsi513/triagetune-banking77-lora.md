# Vamsi513/triagetune-banking77-lora

## Resumen

TriageTune BANKING77 intent adapter es un adaptador LoRA de PEFT publicado por el usuario Vamsi513 sobre el modelo base Qwen/Qwen2.5-1.5B-Instruct (revisión fijada 989aa7980e4cf806f80c7fef2b1adb7bc71aa306). Su única función es clasificar peticiones de soporte bancario escritas en inglés en una de las 77 categorías de intención del benchmark BANKING77, devolviendo un objeto JSON con un campo `category`. No es una copia completa del modelo: los pesos base no se incluyen y el repositorio pesa 0,0 GB, con solo 17,5 MB de pesos de adaptador.

El adaptador entrena 4.358.144 parámetros sobre las proyecciones de atención `q_proj`, `k_proj`, `v_proj` y `o_proj`, con rango 16 y alpha 32. El autor documenta una evaluación sobre un conjunto de test reservado de 3.080 peticiones en el que el adaptador alcanza un 80,49 % de accuracy y un 80,50 % de macro F1, frente al 30,16 % del modelo base sin ajustar. Llama la atención que un baseline clásico de TF-IDF más regresión logística supera al adaptador en 4,19 puntos porcentuales de accuracy.

Es relevante ahora como caso de estudio reproducible de ajuste fino con PEFT en hardware de consumo (el entrenamiento se hizo en Apple MPS en float16), y también como ejemplo de evaluación honesta: el autor publica intervalos de bootstrap, advierte de 422 pares casi duplicados entre particiones no eliminados y documenta que el adaptador no rechaza peticiones fuera de dominio. El repositorio tiene 0 descargas y 1 like en el momento de la consulta, por lo que se trata de un artefacto de investigación sin adopción verificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder-only con grouped-query attention (Qwen2.5-1.5B-Instruct) |
| Parametros totales | Modelo base: aproximadamente 1.540 millones (documentacion publica de Qwen2.5-1.5B-Instruct). Adaptador: 4.358.144 parametros entrenables; los pesos base no se incluyen |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | Modelo base: 32.768 tokens segun su documentacion publica (dato no verificado en la informacion de este adaptador). Longitud maxima de secuencia usada en el entrenamiento del adaptador: 544 tokens |
| Tipos de cuantizacion | No disponible para el adaptador; se distribuye en safetensors sin versiones cuantizadas publicadas |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 (adaptador y repositorio del proyecto); modelo base Apache 2.0; dataset BANKING77 bajo CC BY 4.0 |
| Formato de pesos | safetensors (`adapter_model.safetensors`, 17.462.432 bytes) mas `adapter_config.json` y ficheros de tokenizer; requiere cargar el modelo base por separado |

## Arquitectura y entrenamiento

Se trata de un adaptador LoRA, no de un modelo completo. Los módulos objetivo son las cuatro proyecciones de atención (`q_proj`, `k_proj`, `v_proj`, `o_proj`) del transformer decoder-only subyacente. La configuración declarada es rango 16, alpha 32 y dropout 0,05. El adaptador ocupa 17.462.432 bytes en disco, coherente con 4.358.144 parámetros entrenables en precisión de 32 bits por peso.

El entrenamiento usó pérdida solo sobre la respuesta, con los tokens del prompt enmascarados, longitud máxima de secuencia de 544, micro-lote de 2 con acumulación de 8 (lote efectivo de 16), tasa de aprendizaje 0,0002 con planificador coseno y 30 pasos de calentamiento, semilla 42. La ejecución se detuvo en el paso 251 de optimizador (0,5024 épocas) por un límite de tiempo de pared; el checkpoint seleccionado fue el paso 250, con pérdida de validación 0,065802. El tiempo de entrenamiento medido fue de 13.264 segundos en Apple MPS en float16, incluyendo trabajo posterior a alcanzar el límite. No se documenta uso de RLHF ni DPO, ni innovaciones de decodificación como decodificación especulativa o atención lineal.

En cuanto a los datos, el autor reporta 7.994 peticiones de entrenamiento, 1.998 de validación y 3.080 de test sin tocar, repartidas en 77 categorías de intención; el conjunto de test tiene 40 peticiones por categoría y el de entrenamiento no está balanceado. Se eliminaron 11 duplicados equivalentes del pool original de entrenamiento, pero se marcaron 422 pares casi duplicados entre particiones que no se eliminaron, lo que el propio autor señala como posible fuente de rendimiento optimista. No hay duplicados canónicos exactos entre las particiones preparadas.

## Capacidades

- Clasificación de intención de etiqueta única sobre un conjunto cerrado de 77 categorías de banca, restringido a peticiones cortas escritas en inglés.
- Salida estructurada en JSON con un único campo `category`, pensada para ser validada contra el fichero `labels.json` incluido en el repositorio.
- Fiabilidad de formato medida: en la evaluación no generó ningún JSON inválido, frente al 19,19 % de JSON inválido del modelo base sin ajustar. Sí emitió 8 etiquetas no permitidas (0,26 %), contabilizadas como errores.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No hay capacidades multilingües: el autor limita explícitamente el alcance al inglés.
- No se documentan capacidades de visión, audio ni modo de razonamiento explícito (thinking mode).
- No dispone de detector fiable de peticiones fuera de alcance: en 32 pruebas sintéticas creadas por el proyecto rechazó de forma segura 0 de 8 ejemplos fuera de dominio.

## Casos de uso

- Evaluación comparativa de adaptadores frente a baselines clásicos: el propio autor publica que TF-IDF más regresión logística supera al adaptador en 4,19 puntos de accuracy y 4,05 puntos de macro F1 sobre el mismo test, lo que lo convierte en un caso práctico para estudiar cuándo el ajuste fino de un LLM no bate a un modelo clásico en clasificación de texto corto.
- Pre-etiquetado asistido con revisión humana: el adaptador puede generar una etiqueta candidata para peticiones bancarias similares a BANKING77, siempre con validación posterior contra `labels.json` y revisión de una persona, y nunca como decisión automática según las condiciones del autor.
- Estudio de salidas estructuradas tras ajuste fino: la diferencia entre el 0 % de JSON inválido del adaptador y el 19,19 % del modelo base permite investigar el efecto del ajuste supervisado sobre la adherencia al formato.
- Investigación sobre detección de fuera de dominio: con 0 de 8 rechazos correctos en el conjunto sintético, sirve como caso negativo para diseñar y validar detectores de alcance separados, requisito que el autor exige antes de cualquier uso operativo.
- Reproducción de pipelines PEFT en hardware de consumo: el entrenamiento completo documentado cabe en Apple MPS con float16 (13.264 segundos) y 4,36 millones de parámetros entrenables, lo que lo hace útil para docencia y para validar flujos de trabajo LoRA sin clúster GPU.
- Análisis de fuga de datos y optimismo en métricas: los 422 pares casi duplicados entre particiones permiten estudiar cómo los solapamientos semánticos no eliminados afectan a las estimaciones de precisión.
- Análisis de coste por precisión: sirve para comparar el coste de servir un modelo de 1.500 millones de parámetros con un adaptador de 17,5 MB frente a una tubería clásica de vectorización más regresión logística.
- Banco de pruebas para infraestructura de despliegue con adaptadores: por su tamaño reducido permite validar integración de múltiples adaptadores LoRA sobre el mismo modelo base en entornos locales controlados.

## Benchmarks y rendimiento

Todas las cifras usan la misma partición de test reservada de 3.080 registros de BANKING77. La accuracy y el macro F1 cuentan como incorrectas las salidas inválidas o con etiquetas no permitidas. La generación fue voraz (greedy), con un máximo de 32 tokens nuevos y el prompt exacto de 77 etiquetas que figura en el ejemplo de uso.

| Enfoque | Accuracy | Macro F1 |
|---|---:|---:|
| Baseline de clase mayoritaria | 1,30 % | 0,03 % |
| Modelo base sin modificar | 30,16 % | 30,77 % |
| Adaptador LoRA guardado | 80,49 % | 80,50 % |
| TF-IDF + regresión logística | 84,68 % | 84,54 % |

Detalles adicionales reportados: el adaptador clasificó correctamente 2.479 de 3.080 peticiones, produjo cero objetos JSON inválidos y ocho etiquetas no permitidas (0,26 %). Los intervalos de bootstrap estratificado (10.000 muestras, 95 %, 40 registros por categoría con reemplazo) fueron [79,25 %, 81,72 %] para la accuracy y [79,15 %, 81,69 %] para el macro F1. Los intervalos pareados de la ventaja del baseline clásico sobre el adaptador fueron [2,73; 5,65] puntos porcentuales en accuracy y [2,56; 5,58] puntos en macro F1. El descarte de clases y la evaluación por intención se hicieron sobre el conjunto de 77 etiquetas cerrado.

## Requisitos de hardware

- Pesos del adaptador: 17.462.432 bytes (aproximadamente 17,5 MB) en safetensors.
- Modelo base en float16: aproximadamente 3,1 GB de pesos, más caché KV y sobrecarga del runtime; se estima un consumo de VRAM de 3,5 a 4,5 GB para secuencias cortas.
- Modelo base en int8: aproximadamente 1,6 a 2,0 GB; en 4 bits, aproximadamente 1,0 a 1,5 GB. Son estimaciones de ingeniería, no cifras publicadas por el autor.
- Cabe en GPU de consumo: sí, en tarjetas con 6 GB o más de VRAM en 4 bits y con 8 GB o más en float16, por ejemplo RTX 3060, RTX 4060, RTX 4070 o RTX 4090. El entrenamiento documentado se realizó en Apple MPS en float16 durante 13.264 segundos, no en GPU NVIDIA.
- GPU de centro de datos: no se requieren; A100 o H100 estarían sobredimensionadas para un adaptador de 1,5B, aunque podrían usarse para servir muchas copias en paralelo.
- Opciones de despliegue: transformers con la librería peft para cargar el adaptador sobre el modelo base; vLLM con soporte de adaptadores LoRA para servicio con múltiples adaptadores; para llama.cpp u Ollama sería necesario fusionar el adaptador con los pesos base (`merge_and_unload`) y convertir el resultado a GGUF, paso no documentado por el autor.
- Latencia y throughput de inferencia: no disponible. El autor solo publica el tiempo de entrenamiento (13.264 segundos) y parámetros de decodificación (greedy, máximo 32 tokens nuevos).
- El autor advierte de que no deben enviarse datos sensibles de clientes a puntos de demostración públicos, y que la autenticación, los límites de tasa y las reglas de retención del servicio no han sido verificados.

## Comparativa con modelos similares

| Enfoque | Parámetros | Contexto | Accuracy (BANKING77 test) | Macro F1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este adaptador (LoRA sobre Qwen2.5-1.5B-Instruct) | 4.358.144 entrenables sobre un base de ~1.540 M | 544 tokens de secuencia máxima en entrenamiento | 80,49 % | 80,50 % | Apache 2.0 (base Apache 2.0, dataset CC BY 4.0) | Adaptador público en HuggingFace, 0 descargas, 1 like |
| Qwen2.5-1.5B-Instruct sin ajustar | ~1.540 M | 32.768 tokens según documentación del base | 30,16 % | 30,77 % | Apache 2.0 | Público y ampliamente adoptado |
| TF-IDF + regresión logística | No disponible (modelo clásico de bolsa de palabras) | No aplica | 84,68 % | 84,54 % | No disponible | Baseline descrito por el autor, no empaquetado |
| Baseline de clase mayoritaria | No aplica | No aplica | 1,30 % | 0,03 % | No aplica | Trivial de reproducir |

No se dispone de datos de benchmarks que permitan comparar este adaptador con otros modelos de clasificación de intenciones (por ejemplo, encoder tipo BERT ajustado sobre BANKING77), porque la información proporcionada no incluye esas cifras.

## Limitaciones y advertencias

- El propio autor prohíbe su uso para enrutado de soporte en vivo o automático, decisiones financieras, gestión de fraude o respuestas no supervisadas a clientes.
- No existe un detector fiable de peticiones fuera de alcance: en 32 pruebas sintéticas creadas por el proyecto rechazó correctamente 0 de 8 ejemplos fuera de dominio. Un umbral de rechazo experimental descartaría por error 85 de las 3.080 peticiones válidas del test, y ningún umbral está habilitado en el servicio.
- El modelo está limitado a un conjunto cerrado de 77 etiquetas y a menudo fuerza peticiones no relacionadas dentro de alguna categoría bancaria.
- Riesgo de alucinación de formato moderado pero no nulo: aunque generó cero JSON inválidos en el test, emitió 8 etiquetas no permitidas (0,26 %) que deben rechazarse al parsear la salida.
- 422 pares casi duplicados entre particiones de entrenamiento, validación y test fueron marcados pero no eliminados; el autor lo señala como posible causa de rendimiento optimista.
- La evaluación se limita a peticiones cortas escritas en inglés extraídas de un único benchmark público. No establece rendimiento en otros idiomas, en tráfico real de clientes, ante cambios de producto o política, ante entradas adversarias, ni por subgrupos demográficos.
- No se ha completado ninguna auditoría de equidad ni de privacidad.
- El modelo base no incluye mecanismos de rechazo seguros por sí mismo; el adaptador hereda sus sesgos, que no han sido evaluados.
- Licencias: el adaptador y el repositorio del proyecto son Apache 2.0, el modelo base es Apache 2.0 y el dataset BANKING77 está bajo CC BY 4.0. Las licencias Apache no sustituyen a la licencia del dataset, por lo que hay que cumplir ambas si se redistribuye.
- Las reglas de categoría a equipo y de prioridad mencionadas en el proyecto son anotaciones provisionales escritas aparte: no han sido aprendidas por el adaptador ni constituyen política operativa aprobada.
- El adaptador no debe considerarse una decisión verificada sobre la cuenta del cliente ni una acción recomendada; se exige revisión humana y un detector de alcance validado por separado.

## Enlaces

- Página de HuggingFace del adaptador: https://huggingface.co/Vamsi513/triagetune-banking77-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Repositorio del proyecto TriageTune: https://github.com/vamsi513/triagetune
- Dataset BANKING77 (PolyAI-LDN, task-specific-datasets): https://github.com/PolyAI-LDN/task-specific-datasets/tree/master/banking_data
- Licencia del dataset BANKING77 (CC BY 4.0): https://github.com/PolyAI-LDN/task-specific-datasets/blob/master/LICENSE
- La búsqueda web realizada no devolvió ningún resultado relevante sobre este modelo: los enlaces obtenidos eran hilos de foro en francés sobre reproducción de vídeo, sin relación con el adaptador, el modelo base ni el dataset.
