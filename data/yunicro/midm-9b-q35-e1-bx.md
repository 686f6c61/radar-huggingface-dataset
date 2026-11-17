# yunicro/MiDM-9B-q35-e1-bx

## Resumen

MiDM-9B-q35-e1-bx es un adaptador LoRA (con una cabeza de puntero lineal aprendida) publicado por el usuario yunicro sobre el modelo base Qwen/Qwen3.5-9B-Base. No es un modelo generativo al uso: es un "decision model" que puntúa conjuntamente un conjunto de opciones proporcionadas por el usuario en una sola pasada forward y devuelve probabilidades por opción. No genera SQL, Python ni explicaciones; su salida es una distribución de probabilidad sobre alternativas discretas.

El modelo resuelve el problema de seleccionar acciones tipadas (choice, sí/no y ordinales) a partir de un estado textual, por ejemplo decidir si aprobar un reembolso o solicitar un recibo. Se distribuye como adaptador PEFT con safetensors, acompañado de un cargador Python autocontenido (`midm`), y está pensado para ejecutarse con cuantización NF4 por defecto sobre GPU NVIDIA. El contexto máximo configurado es de 4096 tokens, con opciones individuales limitadas a 192 tokens.

La relevancia actual del proyecto radica en su enfoque de evaluación rigurosa y transparente: el autor publica tablas de resultados emparejados entre la versión 4B y la 9B, documenta explícitamente las pruebas no realizadas (DeepSWE, Terminal-Bench) y separa mediciones propias de comparaciones históricas o de API. La licencia es Apache-2.0 para el adaptador y el código, mientras que el modelo base y los datos de entrenamiento conservan sus propios términos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer decoder (Qwen3.5-9B-Base) + cabeza de puntero lineal |
| Parámetros totales | 9B (modelo base); adaptador LoRA de rango 16 no cuantificado en el repo (0.2 GB) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens de entrada; opciones individuales limitadas a 192 tokens |
| Tipos de cuantización | NF4 por defecto (QLoRA); evaluación en NF4/BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (adaptador y código); el modelo base y los datos conservan sus términos |
| Formato de pesos | safetensors (adaptador PEFT); cargador Python propio |

## Arquitectura y entrenamiento

El modelo combina un adaptador LoRA de rango 16 y alpha 32 sobre el transformer decoder de Qwen3.5-9B-Base con una cabeza de puntero lineal aprendida que puntúa todas las opciones en una única pasada forward. La API acepta preguntas de tipo `choice`, `noul` (sí/no) y `score` (ordinales), y devuelve probabilidades por opción. El estado de entrada se trunca conservando cabeza y cola cuando excede los 4096 tokens.

El entrenamiento se realizó con QLoRA en NF4, una época, semilla 0, learning rate 2e-4 y contexto de entrenamiento de 1024 tokens, sobre los conjuntos `td_train`, `kev_train`, `breadth_v1` y `pp6_new`. La inferencia se configura a 4096 tokens para coincidir con la evaluación. El autor indica que el repositorio no incluye datos de entrenamiento, preguntas en bruto, respuestas, datos financieros, informes ni credenciales.

## Capacidades

- Puntuación conjunta de opciones tipadas: choice, sí/no y ordinales, devolviendo probabilidades por alternativa.
- Clasificación de decisiones sobre estados textuales (pipeline `text-classification`).
- Inferencia offline una vez cacheados el paquete y el modelo base.
- Ejecución con cuantización NF4 por defecto sobre GPU NVIDIA compatible.
- Cargador Python autocontenido (`midm`) con API `predict(state, questions)`.
- No genera SQL, Python, explicaciones ni prosa de informe; el "report writer" del proyecto sigue siendo Qwen3 8B.
- Soporte multilingüe: no disponible en la información proporcionada.

## Casos de uso

- Validación de políticas de reembolso: dado un estado textual ("se requiere recibo para el reembolso; el cliente no lo tiene"), el modelo puntúa acciones como aprobar o revisar, adecuado por su API de decisiones tipadas y su contexto de 4096 tokens.
- Triaje de solicitudes de soporte: clasificar tickets en categorías de acción discretas mediante preguntas `choice`, aprovechando la puntuación conjunta en una sola pasada.
- Enrutamiento de decisiones binarias: usar preguntas `noul` para decidir si escalar un caso a revisión humana o resolverlo automáticamente.
- Puntuación ordinal de severidad o prioridad: con preguntas `score`, asignar niveles ordenados (por ejemplo, prioridad baja/media/alta) a partir de descripciones de incidencias.
- Evaluación de verificación de candidatos: el autor documenta su uso en la reproducción de veredictos del verificador DeepSWE (31/38 reproducidos), lo que lo hace adecuado para seleccionar entre soluciones candidatas ya generadas.
- Selección de respuestas en pipelines de generación: puntuar opciones pregeneradas por otro modelo (best-of-N) en lugar de generar directamente, útil cuando ya se dispone de un pool de candidatos.
- Validación financiera retrospectiva: el autor reporta una precisión de acción del 54,37% en decisiones KOSPI retrospectivas reutilizadas, aunque advierte explícitamente que no son señales en vivo.

## Benchmarks y rendimiento

Evaluación primaria emparejada (NF4/BF16 sobre RTX 3090, entrada máxima 4096, presupuesto de tokens por lote 4096, TTA=1; mismos ítems y orden):

| Suite | N | 4B | 9B |
|---|---:|---:|---:|
| Typed Decisions test | 2000 | 78,85% | 79,30% |
| Kev transfer test | 764 | 79,84% | 82,59% |
| JevBench original | 72 | 91,67% | 97,22% |
| JevBench easy | 48 | 100,00% | 100,00% |
| JevBench hard | 111 | 45,95% | 54,05% |

Otras pruebas documentadas por el autor:

| Prueba | Resultado |
|---|---|
| DeepSWE verifier replay (CLM) | 31/38 (81,58%) reproducidos; p unilateral exacta = 0,062 en 13 tareas de resultado mixto |
| SQL best-of-N Spider | 4B 78,34% → 9B 77,27% |
| SQL holdout | 4B 81,66% → 9B 81,77% |
| Python hard80 | 4B 28,75% → 9B 25,00% |
| Enrutamiento aprendido JevBench público 231 | MiDM 77,06%; router 79,65%; Qwen3-4B reasoning local 81,82% |
| Validación financiera (v0.2.2) | Precisión de acción 54,37% (decisiones KOSPI retrospectivas) |

El autor advierte que estas son precisiones retrospectivas de etiqueta dura y no puntuaciones compuestas oficiales de JevBench. Las pruebas MiDM DeepSWE y Terminal-Bench local quedan sin medir por falta de trazas de candidatos o artefactos de evaluación coincidentes.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el modelo base es de 9B parámetros y la evaluación se ejecutó en NF4/BF16 sobre una RTX 3090 (24 GB), lo que sugiere que cabe en 24 GB con cuantización NF4.
- GPU recomendadas: RTX 3090 (usada en la evaluación); se requiere una GPU NVIDIA compatible según el autor. No se especifican A100 ni H100.
- GPU de consumo: sí, según la evaluación sobre RTX 3090.
- Despliegue: cargador Python propio (`midm`) con PEFT; no se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: el autor reporta que dos procesos 4B con entrada corta casi duplicaron el throughput, mientras que 4B con 2048 tokens y 9B con 4096 tokens perdieron rendimiento; son pilotos sintéticos de una sola prueba, no certificación de resistencia ni de memoria mínima.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiDM-9B-q35-e1-bx | 9B (base) + LoRA | 4096 | Puntuación de decisiones tipadas | Apache-2.0 (adaptador) | Hugging Face |
| MiDM 4B (versión original) | 4B (base) + LoRA | no disponible | Puntuación de decisiones tipadas | Apache-2.0 (adaptador) | Hugging Face |
| Qwen3-4B reasoning (local) | 4B | no disponible | Generación/razonamiento | según modelo base | Hugging Face |
| Router aprendido del proyecto | no disponible | no disponible | Enrutamiento de decisiones | no disponible | interno del proyecto |

En JevBench público 231, el router del proyecto obtuvo 79,65% y Qwen3-4B reasoning local 81,82%, frente al 77,06% de MiDM; el autor no promovió el router por no demostrar no inferioridad ni ahorro de latencia.

## Limitaciones y advertencias

- No genera texto, SQL, Python ni explicaciones; solo puntúa opciones proporcionadas.
- Las salidas son probabilidades por opción, no confianza calibrada garantizada.
- El estado de entrada se trunca a 4096 tokens conservando cabeza y cola, lo que puede perder información intermedia.
- Las opciones individuales están limitadas a 192 tokens.
- Los resultados de JevBench son precisiones retrospectivas de etiqueta dura, no puntuaciones compuestas oficiales.
- La validación financiera se basa en decisiones KOSPI retrospectivas reutilizadas; no son señales en vivo ni mejoras de benchmark general.
- El autor documenta regresiones en SQL/Python best-of-N al pasar de 4B a 9B (Spider 78,34% → 77,27%; Python hard80 28,75% → 25,00%).
- No se estableció significación estadística al 5% en la reproducción de DeepSWE (p = 0,062).
- Las pruebas DeepSWE de MiDM y Terminal-Bench local quedan sin medir.
- Sesgos conocidos: no disponible.
- Riesgo de alucinación: no aplica de forma directa al no generar texto, pero la calibración de probabilidades no está garantizada.
- Idiomas soportados: no disponible.
- La licencia Apache-2.0 cubre el adaptador y el código; el modelo base y los datos de entrenamiento conservan sus propios términos.
- El repositorio no incluye datos de entrenamiento ni credenciales; el uso en producción requiere verificar la licencia del modelo base.

## Enlaces

- Hugging Face: https://huggingface.co/yunicro/MiDM-9B-q35-e1-bx
- Revisión v0.2.0: https://huggingface.co/yunicro/MiDM-9B-q35-e1-bx/tree/v0.2.0
- Informe ScenarioView: https://yeohoonyun.github.io/midm-decision-models/
- Notas de validación v0.2.2: financial_validation/v0.2.2/README.md (relativo al repo)
- Atlas de benchmarks v0.2.1: benchmarks/v0.2.1/README.md (relativo al repo)
- GitHub release v0.2.1: https://github.com/YeoHoonYun/midm-decision-models/releases/tag/v0.2.1
- GitHub release v0.2.0: https://github.com/YeoHoonYun/midm-decision-models/releases/tag/v0.2.0
- DOI de versión v0.2.1: https://doi.org/10.5281/zenodo.23164651
- DOI conceptual: https://doi.org/10.5281/zenodo.23084583
