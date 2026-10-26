# wpit-collab/mar-huge-wpit-imagenet-800ep-nonema

## Resumen

MAR-H (WPIT) es un modelo de generación de imágenes condicionada a clase, entrenado sobre ImageNet, que se distribuye aquí como exportación de inferencia del checkpoint `checkpoint-799.pth` (800 épocas completadas) en su variante non-EMA. Lo publica la organización `wpit-collab` y emplea la arquitectura MAR (masked autoregressive) combinada con un tokenizador/decoder WPIT basado en VAE. El modelo resuelve la generación class-conditional a 256×256 píxeles sobre las 1000 clases de ImageNet, y su interés radica en que forma parte de la línea de investigación de generación autorregresiva de imágenes sin cuantización vectorial, un enfoque alternativo a los modelos de difusión puros y a los transformers autoregresivos clásicos sobre tokens discretos.

El artefacto pesa 3,8 GB y contiene 942.685.824 parámetros en safetensors, con los dtypes originales preservados y sin pesos de optimizador ni de EMA. No es un modelo estándar de Transformers: requiere el código del repositorio `CHEN-YIZHU/WPIT_test` y el tokenizador/decoder correspondiente (`ckpt-last-90%WPIT.pth`), que no se incluye en el repositorio. Por tanto, el archivo por sí solo no constituye un pipeline de generación de imágenes completo.

La model card reporta una evaluación verificada sobre 50.000 muestras por configuración con el evaluador oficial ADM de TensorFlow: gFID de 31,1822 sin classifier-free guidance y de 28,0658 con CFG 3,2. Es un modelo de investigación, con 0 descargas y 0 likes en el momento de la ficha, licencia no declarada y una dependencia fuerte de código externo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MAR-H (masked autoregressive) con diffloss; VAE con stride 16, patch size 1, dimensión latente 64 |
| Parametros totales | 942.685.824 (~0,94 mil millones) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica en el sentido de LLM; la generación recorre 256 tokens latentes (16×16) en 256 iteraciones MAR, con 100 pasos de difusión en el diffloss |
| Tipos de cuantizacion | no disponible (los pesos se exportan con sus dtypes originales; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | en (según metadatos); no es un modelo de lenguaje, no procesa texto |
| Licencia | no disponible (la model card indica que se aplican los términos del código upstream, el modelo base y el dataset, sin concesión adicional) |
| Formato de pesos | safetensors |
| Resolucion de imagen | 256×256 |
| Condicionamiento | Clase (1000 clases de ImageNet) |
| Buffer size | 64 |
| Diffloss | Profundidad 12, anchura 1536 |
| Pasos de muestreo de difusion | 100 |
| Pesos EMA incluidos | No (exportación non-EMA) |
| Tamano del repositorio | 3,8 GB |
| Compatibilidad con Transformers | No (arquitectura custom, requiere el repositorio WPIT_test) |
| Pipeline declarado | no disponible |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo sigue la familia MAR (masked autoregressive), en la que la generación de imágenes se plantea como una secuencia de predicciones autorregresivas sobre latentes continuos en lugar de tokens discretos. La imagen se codifica con un VAE de stride 16, lo que produce un mapa latente de 16×16 con dimensión 64; con patch size 1, la secuencia de generación consta de 256 posiciones. Cada paso autorregresivo se resuelve con un módulo de difusión (`diffloss`) de profundidad 12 y anchura 1536, configurado con 100 pasos de muestreo de difusión. El condicionamiento es de clase, con 1000 categorías y un buffer de 64.

El entrenamiento se realizó sobre ImageNet durante 800 épocas (checkpoint `checkpoint-799.pth`, con indexación desde cero), según la configuración recogida en `training_args.json`, incluido en el repositorio. La información proporcionada no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de RLHF o DPO; en un modelo class-conditional de este tipo, el ajuste se realiza sobre etiquetas de clase y no sobre preferencias humanas. La exportación conserva los dtypes originales de los tensores y excluye optimizador y pesos EMA; los 604 tensores non-EMA pasaron comprobaciones de finitud e igualdad exacta en el ciclo de guardado y carga, y el hash del archivo se registra en `SHA256SUMS`.

## Capacidades

- Generación de imágenes condicionada a clase sobre las 1000 categorías de ImageNet, a resolución fija de 256×256.
- Muestreo con classifier-free guidance lineal, con escalas documentadas de 1 (sin CFG) y 3,2.
- Generación estocástica controlada por temperatura (evaluación oficial con temperatura 1) y por el número de iteraciones MAR (256 en la configuración verificada).
- No soporta texto como entrada: no es un modelo text-to-image ni acepta prompts en lenguaje natural.
- No dispone de tool calling ni function calling.
- No está orientado a agentes ni a razonamiento multi-paso en el sentido de los LLM.
- No tiene capacidades multilingües ni de procesamiento de lenguaje; el tag `en` de los metadatos no implica competencia lingüística.
- No incorpora modo thinking, visión general, audio ni otras modalidades.
- Capacidad de reproducción de un pipeline de investigación: carga estricta del `state_dict` sobre la arquitectura `eval/mar_ray` del repositorio WPIT_test.

## Casos de uso

- Reproducción de resultados académicos: permite recargar el estado exacto del checkpoint de la época 800 y recalcular gFID e IS con el evaluador ADM oficial, usando 50.000 muestras por configuración y el mismo protocolo (BF16, temperatura 1, 256 iteraciones MAR, 100 pasos de difusión, IS split 5000).
- Estudio de classifier-free guidance: al estar documentadas las escalas 1 y 3,2, sirve para trazar curvas de compromiso entre fidelidad (gFID) y diversidad (IS) en un mismo checkpoint.
- Ablación EMA frente a non-EMA: este repositorio aísla los pesos sin media móvil, de modo que puede compararse directamente con la variante EMA del mismo entrenamiento para cuantificar su efecto en la calidad de muestra.
- Investigación en generación autorregresiva sin cuantización vectorial: la combinación de latentes continuos con un `diffloss` de profundidad 12 y anchura 1536 es un banco de pruebas para estudiar alternativas a los tokens discretos y a la difusión pura.
- Generación de datos sintéticos class-conditional para augmentación: puede producir lotes de imágenes de una clase concreta de ImageNet para complementar conjuntos de entrenamiento pequeños en tareas de clasificación o detección.
- Benchmark de infraestructura de inferencia: el coste de muestreo (256 iteraciones autorregresivas con 100 pasos de difusión cada una) lo convierte en una carga útil para medir throughput y planificación de memoria en GPUs de distinta gama.
- Docencia y divulgación técnica: sirve para ilustrar en un curso la diferencia entre generación autoregresiva discreta, generación por difusión y el enfoque híbrido de MAR, siempre que se acompañe del código y el tokenizador necesarios.
- Auditoría de artefactos de publicación: la presencia de `SHA256SUMS` y de comprobaciones de finitud y de igualdad exacta en carga permite usarlo como caso práctico de verificación de integridad de pesos.

## Benchmarks y rendimiento

Evaluación verificada según la model card: 50.000 muestras class-conditional de ImageNet por configuración, BF16, temperatura 1, 256 iteraciones MAR, 100 pasos de difusión, CFG lineal, evaluador oficial ADM de TensorFlow, IS split size 5000.

| Configuracion | gFID (menor es mejor) | IS (mayor es mejor) |
|---|---:|---:|
| Sin CFG (escala 1) | 31,1822 | 68,8726 |
| CFG 3,2 | 28,0658 | 81,5496 |

La model card advierte que los ajustes del paper de UniFlow difieren en tamaño del generador, calendario de entrenamiento y resolución, por lo que las cifras no constituyen comparaciones controladas solo por tokenizador. No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de otras tareas de texto, que no aplican a este modelo.

## Requisitos de hardware

- Peso de los pesos: 3,77 GB en FP32 (coherente con los 3,8 GB del repositorio y con dtypes originales preservados), ~1,89 GB en BF16, ~0,94 GB en FP8/INT8 y ~0,47 GB en INT4.
- VRAM estimada para inferencia: orientativamente 6-10 GB en BF16 a lote 1, sumando activaciones y el tokenizador/decoder WPIT externo; el cálculo exacto no está documentado y depende del tamaño de lote.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 Ti y RTX 4090 24 GB en BF16; en FP32 conviene al menos 8-12 GB.
- GPU de datacenter recomendadas: A100 40 GB, A100 80 GB, H100, especialmente para generar 50.000 muestras por configuración a escala de evaluación.
- Opciones de despliegue: exclusivamente PyTorch con el código de `CHEN-YIZHU/WPIT_test` y la arquitectura `eval/mar_ray`; no hay soporte en vLLM, TGI, llama.cpp ni Ollama, al no ser un modelo de lenguaje ni una arquitectura Transformers estándar.
- Latencia y throughput: no disponibles. Cualitativamente, cada imagen requiere 256 iteraciones MAR con 100 pasos de difusión en el `diffloss`, lo que supone un coste de muestreo elevado frente a un único paso de decodificación.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la información proporcionada, por lo que la comparación cuantitativa no es posible. La siguiente tabla recoge únicamente lo conocido y marca como no disponible el resto.

| Modelo | Parametros | Resolucion / contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MAR-H WPIT non-EMA (este modelo) | 942,7 M | 256×256, 1000 clases | gFID 31,1822 sin CFG; 28,0658 con CFG 3,2; IS 68,8726 / 81,5496 | no disponible | safetensors en HF, requiere código WPIT_test y tokenizador externo |
| Variante EMA del mismo entrenamiento (`checkpoint-799.pth`) | no disponible | 256×256 | no disponible | no disponible | no incluida en este repositorio |
| UniFlow (referencia citada en la model card) | no disponible | no disponible (el paper difiere en tamaño del generador, calendario y resolución) | no disponible | no disponible | no disponible |
| Otros modelos MAR de la familia | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Artefacto incompleto por diseño: la model card indica explícitamente que este archivo no es un pipeline de generación de imágenes y que falta el tokenizador/decoder `ckpt-last-90%WPIT.pth`, sin el cual no se puede decodificar ninguna muestra.
- Dependencia de código externo no versionado en el repositorio: la carga requiere instanciar la arquitectura de `eval/mar_ray` desde `github.com/CHEN-YIZHU/WPIT_test` y usar `safetensors.torch.load_file` con `strict=True`; cualquier divergencia en la definición de la arquitectura provoca fallo de carga.
- Licencia no declarada: no hay concesión de uso comercial, y la model card remite a los términos del código upstream, del modelo base y del dataset. Usarlo en producción sin aclarar la licencia es un riesgo legal.
- Variante non-EMA: se excluyen los pesos de media móvil, práctica habitual para mejorar la calidad de muestra; la model card no aporta métricas comparativas frente al checkpoint con EMA, así que no puede afirmarse la magnitud de la diferencia.
- Sesgos heredados de ImageNet: las 1000 clases provienen de la taxonomía WordNet e incorporan sus desequilibrios y sesgos geográficos y culturales; el modelo no genera categorías fuera de ese vocabulario.
- Riesgo de alucinación visual: como todo generador, puede producir imágenes plausibles pero incorrectas respecto a la clase solicitada, con artefactos locales y sin garantía de correspondencia semántica estricta.
- Resolución y condicionamiento fijos: 256×256 y clase discreta; no admite prompts de texto, imágenes de referencia, control estructural ni resoluciones superiores sin reentrenamiento o adaptación.
- Sin validación comunitaria: 0 descargas y 0 likes en el momento de la ficha, sin retroalimentación de terceros sobre la reproducibilidad de las cifras.
- Sin datos de sesgo medidas ni de evaluación por subgrupos de clase: la model card solo reporta gFID e IS globales.
- Coste de muestreo alto: 256 iteraciones autorregresivas con 100 pasos de difusión por imagen limitan el throughput en comparación con generadores de paso único.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/wpit-collab/mar-huge-wpit-imagenet-800ep-nonema
- Código requerido (WPIT_test): https://github.com/CHEN-YIZHU/WPIT_test
- Configuración de entrenamiento: `training_args.json` dentro del repositorio del modelo
- Hash del archivo exportado: `SHA256SUMS` dentro del repositorio del modelo
- Paper de UniFlow: citado en la model card sin enlace disponible
- Tokenizador/decoder `ckpt-last-90%WPIT.pth`: no incluido y sin enlace de descarga en la información disponible
