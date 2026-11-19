# SZLHOLDINGS/SZL-Khipu-Yachay-Nano

## Resumen

SZL-Khipu-Yachay-Nano es un artefacto de entrenamiento publicado por SZLHOLDINGS en Hugging Face. No es un modelo de lenguaje generativo ni un decodificador de khipus: es un clasificador de intenciones basado en un clasificador bayesiano ingenuo multinomial (Multinomial Naive Bayes) con suavizado de Laplace (α=1.0), entrenado sobre cadenas de palabras tokenizadas a nivel de caracteres Unicode en ingles y castellano. Su funcion es enrutar una consulta hacia una de cinco etiquetas de intencion (`NUMERACY`, `RECORDS`, `RESEARCH_LIMITS`, `DATA_RIGHTS`, `METHODS`) y seleccionar un resumen de fuente curado; el calculo aritmetico lo realiza un componente determinista independiente.

El modelo se entreno con 540 prompts sinteticos autorales y se evaluo con 80 prompts sinteticos de plantilla retenida, sin muestras arqueologicas ni texto de articulos con derechos de autor. El autor declara explicitamente que el resultado de 76/80 (95,0 %) y un F1 macro de 0,9597 no constituyen una estimacion limpia de calidad en retenida prospectiva, porque el mismo desarrollador vio la retroalimentacion de evaluacion y edito el generador de datos. Una prueba post-hoc no ciega de 52 preguntas nuevas, ejecutada con los mismos pesos (SHA-256 `bf346fac...`), obtuvo 24/40 aciertos en dominio (60,0 %) y abstencion en 5/12 preguntas fuera de dominio (41,7 %).

La relevancia del artefacto es metodologica y de gobernanza: documenta con recibos reproducibles la diferencia entre una metrica influida por el desarrollador y una prueba post-hoc, y mantiene el modelo en estado de retencion (HOLD) para cualquier afirmacion de generalizacion o seguridad. No hay pesos de 1.5B, ni commit verificado, ni Space en vivo, ni runtime de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multinomial Naive Bayes con suavizado de Laplace (α=1.0) sobre tokens de caracteres Unicode |
| Parametros totales | no disponible (el artefacto es un JSON con log-verosimilitudes y priors, `model/yachay_nb_v0.json`) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (clasificador de cadenas de palabras, sin ventana de contexto definida) |
| Tipos de cuantizacion | no aplica (no hay pesos neuronales que cuantizar) |
| Idiomas soportados | ingles y castellano a nivel de caracteres; fluidez en quechua no evaluada |
| Licencia | no disponible |
| Formato de pesos | JSON (`model/yachay_nb_v0.json`) con log-verosimilitudes y priors entrenados |

## Arquitectura y entrenamiento

El componente principal es un clasificador bayesiano ingenuo multinomial sobre cadenas de palabras tokenizadas a nivel de caracter de forma consciente de Unicode, con suavizado aditivo de Laplace α=1.0. El script de entrenamiento no realiza llamadas de red ni de GPU y emite un JSON determinista con las log-verosimilitudes y los priors aprendidos. El conjunto de entrenamiento consta de 540 prompts sinteticos escritos por el autor, con cinco etiquetas de intencion, y el conjunto de evaluacion de 80 prompts sinteticos basados en plantillas retenidas. No se usaron muestras arqueologicas ni texto de articulos protegidos por derechos de autor. Los identificadores historicos de khipu (KH) proceden de un indice atribuido por separado y nunca se emplean como etiquetas supervisadas.

El autor documenta dos resultados: un primer curriculo con 30/80 (37,5 %) y un curriculo final revisado con 76/80 (95,0 %) y F1 macro de 0,9597 sobre cinco grupos de intencion de 16 ejemplos cada uno. Como el mismo desarrollador reviso la retroalimentacion de evaluacion y edito el generador de datos, el autor califica ese resultado como no equivalente a una estimacion prospectiva limpia y conserva ambos recibos de ejecucion. Ademas, una prueba post-hoc de 52 preguntas nuevas, creada despues de inspeccionar las plantillas de entrenamiento y desarrollo y por tanto no ciega, obtuvo 24/40 (60,0 %) en dominio y 5/12 (41,7 %) de abstencion fuera de dominio con los pesos sin cambios (SHA-256 `bf346facd30fa7abdabdb2dc8f5aa67058c122f98a7cf2b2d626f5cd03470646`; bytes del desafio `41ef4eeabfb1ed12e42e659aff39fa32f405474e59e973c7ff6f0090751b9838`). Los siete prompts fuera de dominio restantes recibieron una etiqueta en dominio no soportada.

## Capacidades

- Clasificacion de intenciones en cinco categorias: `NUMERACY`, `RECORDS`, `RESEARCH_LIMITS`, `DATA_RIGHTS` y `METHODS`.
- Seleccion de un resumen de fuente curado a partir de la etiqueta de intencion predicha.
- Enrutamiento con una puerta de abstencion para baja cobertura fuera de dominio (OOD), que el autor describe como existente pero no garantia de seguridad.
- Componente determinista independiente de comprobacion aritmetica moderna, separado del clasificador entrenado.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: tokenizacion consciente de caracteres en ingles y castellano; fluidez en quechua no evaluada.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso

- Enrutamiento de consultas en un demostrador de investigacion sobre patrimonio andino: el clasificador asigna una consulta a una de las cinco intenciones y recupera el resumen de fuente correspondiente, con la puerta de abstencion como salvaguarda ante entradas fuera de dominio.
- Reproduccion de experimentos de gobernanza de datos: el JSON de pesos y el script sin red ni GPU permiten reproducir el entrenamiento de forma determinista y auditar los recibos de las dos ejecuciones de curriculo.
- Evaluacion de practicas de validacion: sirve como caso de estudio para comparar una metrica influida por el desarrollador (76/80) con una prueba post-hoc no ciega (60,0 % en dominio), util en formacion de equipos de ML sobre fuga de informacion en evaluacion.
- Banco de pruebas de calibracion y abstenccion: el autor advierte que la puntuacion de enrutamiento tipo confianza puede ser sobreconfiada; el artefacto permite medir la tasa de abstencion OOD (41,7 % en la prueba post-hoc) antes de integrar cualquier clasificador en un pipeline.
- Prototipo de etiquetado de intenciones para corpus documentales: con datos propios y revision de derechos, el mismo esquema de cinco etiquetas puede servir de base para anotar consultas de usuarios sobre limites de investigacion y derechos de datos.
- Validacion de infraestructura de publicacion de modelos: el artefacto incluye hashes SHA-256 de pesos y de conjuntos de evaluacion, lo que permite probar flujos de verificacion de commits, revision de derechos y lectura independiente en linea antes de promover una version.

## Benchmarks y rendimiento

| Evaluacion | Conjunto | Resultado | Notas |
|---|---|---|---|
| Curriculo inicial | 80 prompts sinteticos de plantilla | 30/80 (37,5 %) | Revisado por el autor |
| Curriculo final | 80 prompts sinteticos de plantilla | 76/80 (95,0 %), F1 macro 0,9597 | Influido por el desarrollador; no es estimacion prospectiva limpia |
| Prueba post-hoc en dominio | 40 preguntas etiquetadas a mano | 24/40 (60,0 %) | No ciega, creada tras inspeccionar plantillas |
| Prueba post-hoc fuera de dominio | 12 preguntas no relacionadas | 5/12 abstenciones (41,7 %) | 7 recibieron etiqueta en dominio no soportada |
| Decodificacion historica de khipu | no aplica | no testeado | Declarado explicitamente |
| Fluidez en quechua | no aplica | no testeada | Declarado explicitamente |
| Calibracion | no aplica | no testeada | Declarado explicitamente |
| Robustez ante alucinacion o sesgo | no aplica | no cualificada | Declarado explicitamente |

## Requisitos de hardware

- VRAM estimada para inferencia: practicamente nula; el modelo es un JSON de log-verosimilitudes y priors, sin pesos neuronales.
- GPU recomendadas: no se requiere GPU; el script de entrenamiento no realiza llamadas de GPU.
- Compatibilidad con GPU de consumo: irrelevante, el artefacto cabe en memoria principal de cualquier equipo.
- Opciones de despliegue: ejecucion directa del script de puntuacion (`python -B scripts/score_posthoc.py` para la prueba post-hoc); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI porque no es un modelo generativo.
- Latencia y throughput: no disponibles; el autor no publica mediciones de latencia ni de rendimiento en produccion.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|---|
| SZL-Khipu-Yachay-Nano | Multinomial Naive Bayes (clasificador de intenciones) | no disponible (JSON de log-verosimilitudes) | no aplica | no disponible | Artefacto de investigacion, en HOLD |
| SZL-Khipu-1.5B | Modelo de lenguaje generativo (segun la model card) | 1.5B | no disponible | no disponible | Referenciado como modelo distinto |
| KHIPU-R2 | no disponible | no disponible | no disponible | no disponible | Referenciado como modelo distinto |
| szl-khipu | Kernel NumPy (software) | no aplica | no aplica | no disponible | Referenciado como software separado |

No se dispone de datos de rendimiento de los modelos comparables en la informacion proporcionada, por lo que no se puede establecer una comparativa cuantitativa.

## Limitaciones y advertencias

- No es un modelo de lenguaje generativo ni un decodificador de khipus; cualquier uso que presuponga generacion de texto o decodificacion historica es incorrecto.
- El resultado de 76/80 (95,0 %) esta influido por el desarrollador y no constituye una estimacion limpia de calidad prospectiva en datos retenidos.
- La prueba post-hoc de 52 preguntas no es ciega ni independiente; no es admisible para entrenamiento, ajuste de curriculo, aprendizaje de preferencias ni afirmaciones de precision prospectiva ciega.
- La puntuacion de enrutamiento tipo confianza no es una probabilidad factual calibrada; la calibracion no se ha testeado.
- La puerta de abstencion OOD existe pero no es una garantia de seguridad: en la prueba post-hoc, 7 de 12 prompts fuera de dominio recibieron etiquetas en dominio no soportadas.
- Fluidez en quechua, decodificacion historica de khipu, robustez ante sesgos y alucinacion: no testeadas o no cualificadas.
- El titulo "Yachay" reconoce inspiracion linguistica quechua, pero el autor declara explicitamente que no implica autoria indigena, traduccion, aval ni desciframiento; la investigacion con comunidades andinas se senala como paso siguiente obligatorio.
- Licencia no disponible: no se puede confirmar el uso comercial ni la redistribucion.
- No hay commit de modelo verificado en Hugging Face, ni Space en vivo, ni runtime de produccion desplegado.
- El autor exige revision de derechos, hashes de modelo y dataset, y lectura independiente en linea antes de publicar; cualquier extension a LoRA debe fijar base compatible, revisiones exactas de dataset, derechos, datos retenidos y presupuesto de GPU separado.
- Estado declarado: HOLD para afirmaciones de generalizacion y seguridad; el sistema es una demostracion de investigacion, no un sistema desplegable de interpretacion arqueologica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SZLHOLDINGS/SZL-Khipu-Yachay-Nano
- Repositorio de referencia `SZLHOLDINGS/SZL-Khipu-1.5B`: https://huggingface.co/SZLHOLDINGS/SZL-Khipu-1.5B
- Artefactos de evaluacion citados en la model card: `data/posthoc_ood_v0.jsonl` y `scripts/score_posthoc.py` (incluidos en el repositorio del modelo, segun el autor)
- Pesos entrenados: `model/yachay_nb_v0.json` (SHA-256 `bf346facd30fa7abdabdb2dc8f5aa67058c122f98a7cf2b2d626f5cd03470646`)
- Bytes del desafio post-hoc: SHA-256 `41ef4eeabfb1ed12e42e659aff39fa32f405474e59e973c7ff6f0090751b9838`
- Papers, blogs, repos y demos adicionales: no disponibles en la informacion proporcionada
