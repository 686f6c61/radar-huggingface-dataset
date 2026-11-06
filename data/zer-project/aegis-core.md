# Zer-project/Aegis-Core

## Resumen

Aegis-Core es un proyecto de desarrollo de modelos de lenguaje open source impulsado por el usuario Zer-project, cuyo primer artefacto público es Aegis-Nano, un transformer decoder-only de 17.011.584 parámetros con 6 capas, 6 cabezas de atención, dimensión de embedding de 384 y una longitud de contexto de solo 256 tokens. El modelo se distribuye bajo licencia Apache 2.0 y está entrenado sobre texto en inglés e indonesio.

El proyecto se presenta explícitamente como experimental y en desarrollo activo: la model card documenta objetivos, metodología de entrenamiento, resultados de evaluación y limitaciones conocidas, incluyendo incoherencia en la generación, repeticiones y ausencia de benchmarks de generalización amplia. No es un modelo orientado a producción, sino una pieza de investigación reproducible con trazabilidad de decisiones de arquitectura.

Su relevancia actual es limitada en términos de capacidades, pero resulta útil como referencia didáctica: un modelo de escala "nano" que permite reproducir el pipeline completo de entrenamiento (tokenizador de 16.384 entradas, AdamW, schedule coseno, semilla fija 1337) en hardware modesto y comparar checkpoints mediante perplejidad sobre conjuntos de evaluación propios e independientes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only |
| Parametros totales | 17.011.584 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en), indonesio (id) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (la model card indica que los pesos se publicarán tras las comprobaciones de release) |

## Arquitectura y entrenamiento

Aegis-Nano es un transformer decoder-only con 6 capas, 6 cabezas de atención, dimensión de embedding de 384 y un vocabulario de 16.384 tokens. La configuración corresponde a un modelo de escala reducida, con una ventana de contexto de 256 tokens que limita severamente el modelado de dependencias de largo alcance.

El experimento de entrenamiento v2 se realizó durante 10.000 pasos con el optimizador AdamW, un schedule de learning rate coseno y semilla aleatoria 1337. El corpus de entrenamiento contiene texto en inglés e indonesio; no se especifica el número total de tokens, la composición del dataset ni si se aplicaron fases de RLHF, DPO o ajuste supervisado. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal. La evaluación se realizó sobre dos conjuntos (uno "old" con stride 1 y uno "independent" con stride 4), comparando el checkpoint v1 en el paso 2.000 con el v2 en el paso 10.000.

## Capacidades

- Generación de texto autoregresiva en inglés e indonesio.
- Modelado de lenguaje a nivel de token con vocabulario de 16.384 entradas.
- Evaluación reproducible mediante pérdida y perplejidad sobre conjuntos propios e independientes.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta modo de pensamiento (thinking), visión, audio ni otras modalidades.
- Capacidad multilingüe limitada a los dos idiomas del corpus de entrenamiento.

## Casos de uso

- Reproducción de pipelines de entrenamiento: el modelo sirve como banco de pruebas para validar configuraciones de AdamW, schedules cosenos y semillas fijas en un entorno de 17M de parámetros que cabe en una sola GPU consumer.
- Docencia e investigación sobre scaling laws: permite estudiar la relación entre pasos de entrenamiento, pérdida y perplejidad comparando checkpoints intermedios (v1 en el paso 2.000 frente a v2 en el paso 10.000).
- Evaluación de tokenizadores: con un vocabulario de 16.384 entradas y corpus bilingüe inglés-indonesio, es útil para analizar el impacto del tokenizador en la perplejidad de lenguas de bajos recursos.
- Pruebas de infraestructura de serving: al ser un modelo pequeño, se puede desplegar en entornos de CI para validar integraciones con frameworks de inferencia antes de migrar a modelos mayores.
- Experimentos de contaminación de datasets: la distinción entre conjunto "old" e "independent" de la model card ofrece un caso práctico para estudiar solapamiento semántico y contaminación a nivel de fuente.
- Generación de texto de bajo coste en prototipos: para demos internas en inglés o indonesio donde la coherencia no sea crítica y el contexto no supere 256 tokens.
- Análisis de limitaciones de contexto corto: útil para medir empíricamente la degradación de la coherencia con ventanas de 256 tokens frente a arquitecturas con contextos mayores.

## Benchmarks y rendimiento

Los únicos datos publicados son métricas de pérdida y perplejidad sobre dos conjuntos de evaluación del propio proyecto. No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

| Checkpoint | Conjunto de evaluación | Loss | Perplejidad |
|---|---|---:|---:|
| v1 — paso 2.000 | Old (stride 1) | 6,3760 | 587,6 |
| v1 — paso 2.000 | Independent (stride 4) | 6,3612 | 578,9 |
| v2 — paso 10.000 | Old (stride 1) | 5,3670 | 214,2 |
| v2 — paso 10.000 | Independent (stride 4) | 5,3799 | 217,0 |

La model card advierte que el conjunto independiente usa stride 4 en lugar de evaluar todas las ventanas posibles, que la independencia del dataset no garantiza ausencia de solapamiento semántico o contaminación a nivel de fuente, y que estas métricas no establecen comprensión amplia del lenguaje ni generalización.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para los 17M de parámetros (aproximadamente 68 MB de pesos), más el overhead del runtime y la caché KV para 256 tokens.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no se requiere A100 ni H100. Una RTX 4090 o una RTX 3060 sobran para este modelo.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 2 GB de VRAM, e incluso en CPU.
- Opciones de despliegue: no se especifican en la model card. Al no publicarse todavía los pesos ni el formato, no se puede confirmar compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks estándar ni de especificaciones de despliegue que permitan una comparación rigurosa con alternativas. Se incluye una comparación estructural con modelos de escala reducida de propósito general, marcando como "no disponible" los campos sin datos verificables.

| Modelo | Parámetros | Contexto | Licencia | Idiomas | Benchmarks publicados |
|---|---:|---:|---|---|---|
| Aegis-Nano (Aegis-Core) | 17,0M | 256 | Apache 2.0 | en, id | Solo pérdida/perplejidad propios |
| GPT-2 small | 124M | 1.024 | MIT | en | Sí (referencia histórica) |
| SmolLM-135M | 135M | 2.048 | Apache 2.0 | en (principalmente) | Sí |
| TinyLlama-1.1B | 1,1B | 2.048 | Apache 2.0 | en (principalmente) | Sí |

La comparación es únicamente orientativa: Aegis-Nano es entre 7 y 65 veces menor en parámetros que las alternativas listadas y su contexto es de 4 a 8 veces más corto, por lo que no es un sustituto funcional de ninguno de ellos.

## Limitaciones y advertencias

- Coherencia de texto inconsistente, según reconoce la propia model card.
- Repetición durante la generación.
- Longitud de contexto muy limitada (256 tokens), insuficiente para conversaciones multi-turno o documentos.
- Sin benchmark verificado de generalización amplia; la perplejidad no debe interpretarse como medida aislada de calidad.
- Riesgo de contaminación entre conjuntos de evaluación pese a la separación declarada; la model card lo advierte explícitamente.
- Sesgos no documentados: no se especifica composición del corpus ni filtrado, por lo que no se pueden evaluar sesgos de género, etnia o idioma.
- Riesgo de alucinación no cuantificado; en un modelo de 17M de parámetros la generación fiable de hechos es prácticamente nula.
- Estado del repositorio: la model card indica que los pesos se publicarán tras las comprobaciones de release; el tamaño del repo (0,4 GB) no garantiza que los pesos estén disponibles en el momento de la consulta.
- Licencia Apache 2.0 permite uso comercial del modelo, pero los términos del dataset y de componentes de terceros quedan sujetos a sus propias licencias, no documentadas.
- Proyecto experimental en desarrollo activo: la API, la arquitectura y los artefactos pueden cambiar sin aviso.

## Enlaces

- HuggingFace: https://huggingface.co/Zer-project/Aegis-Core
- GitHub del proyecto: https://github.com/Zer-security/Aegis-Core
