# udomain/kestrel-explainer-4b

## Resumen

Kestrel-Explainer-4B es un modelo de lenguaje especializado en el análisis de cumplimiento normativo de la **Personal Data (Privacy) Ordinance (Cap. 486)** de Hong Kong y de sus seis principios de protección de datos (DPP1–DPP6). Lo desarrolla el usuario `udomain` como un ajuste fino supervisado sobre `Qwen/Qwen3-4B`, con el objetivo de sustituir a un modelo interno previo (`UD_model_v4_explanation`) en tareas de clasificación y explicación de posibles violaciones de privacidad.

El modelo recibe entradas heterogéneas —texto narrativo, JSON, CSV, logs clave-valor y prompts de pasarelas LLM— y devuelve un único objeto JSON sin envoltorio Markdown, con campos estructurados para indicar si hay violación, el nivel de confianza, la etiqueta DPP afectada, un subcódigo `snake_case` y una explicación jurídica que cita secciones estatutarias concretas sin reproducir PII literal.

Con 4.022 millones de parámetros, licencia Apache 2.0 y soporte para inglés, chino tradicional de Hong Kong y chino simplificado, el modelo es relevante para equipos que necesiten un guardrail de privacidad desplegable localmente, con salida determinista y sin dependencia de servicios externos. Su arquitectura subyacente es la de Qwen3 (transformer causal con `use_cache=True`), empaquetada como `Qwen3ForCausalLM` en `bfloat16`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (`Qwen3ForCausalLM`), `bfloat16`, `use_cache=True` |
| Parametros totales | 4.022.468.096 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (los ejemplos de despliegue usan `max_model_len=4096`) |
| Tipos de cuantizacion | No se documentan cuantizaciones publicadas; los pesos se distribuyen en `bfloat16` |
| Idiomas soportados | Ingles (`en`), chino tradicional de Hong Kong (`zh-Hant-HK`) y chino simplificado (`zh-Hans-HK`) |
| Licencia | Apache 2.0 |
| Formato de pesos | `safetensors` (repo de 8,1 GB; pesos `bfloat16` de 7,6 GB) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de `Qwen/Qwen3-4B`, un transformer causal denso de 4.022 millones de parametros. Se distribuye como un checkpoint `Qwen3ForCausalLM` independiente en `bfloat16`, con `use_cache=True`, lo que permite su carga directa con `transformers` o `vLLM`. La model card no detalla la composicion exacta del dataset de ajuste ni el numero de tokens utilizados.

Las etiquetas del repositorio (`pdpo`, `cap486`, `pcpd`, `privacy`, `guardrail`, `compliance`) y la descripcion del autor indican un entrenamiento orientado a clasificacion juridica y generacion de explicaciones estructuradas. El modelo esta disenado para emitir una salida JSON pura con cinco campos (`if_violate`, `confidence`, `label`, `violating_content`, `explanation`), lo que sugiere un ajuste supervisado sobre pares entrada-salida con formato fijo. No se documenta en la informacion disponible el uso de RLHF, DPO ni tecnicas de decodificacion especulativa.

Una innovacion destacable es el diseno de la salida: la explicacion debe citar secciones estatutarias y subprincipios DPP, describir categorias de datos concretas y proponer remediacion accionable sin repetir PII literal, lo que reduce el riesgo de fuga de datos sensibles en la propia respuesta del modelo.

## Capacidades

- Generacion de texto y razonamiento juridico especializado en la Cap. 486 y los DPP1–DPP6 de Hong Kong.
- Clasificacion estructurada de cumplimiento con salida JSON determinista (`if_violate` en {0, 1, 2}, `confidence` en {high, medium, low}, `label` en {DPP1..DPP6, null}).
- Asignacion de subcodigos de violacion en `snake_case` (`violating_content`).
- Generacion de explicaciones que citan secciones estatutarias y subprincipios DPP sin reproducir PII literal.
- Procesamiento de entradas heterogeneas: texto narrativo, JSON, CSV, logs clave-valor y prompts de pasarelas LLM.
- Soporte multilingue para ingles, chino tradicional de Hong Kong y chino simplificado, con requisito de pureza de script (sin mezcla ZH/EN en la salida).
- Razonamiento multi-DPP (por ejemplo, deteccion conjunta de DPP4 y DPP1).
- No se documenta soporte de tool calling, function calling, vision, audio ni modo thinking explicito en la informacion disponible.

## Casos de uso

- **Guardrail de privacidad en pasarelas LLM**: el modelo puede colocarse como filtro previo o posterior a las llamadas a un LLM general, analizando los prompts y las respuestas para detectar posibles infracciones de la Cap. 486 antes de que los datos salgan del perimetro. Su salida JSON facilita la integracion en pipelines automatizados.
- **Auditoria de dossiers empresariales**: con entradas en JSON, CSV o texto narrativo, el modelo clasifica cada caso segun el DPP afectado y genera una explicacion citando secciones estatutarias, lo que acelera la revision por parte de equipos de compliance.
- **Triaje de incidentes de datos**: ante un log clave-valor o un informe de incidente, el modelo devuelve `if_violate` y `confidence`, permitiendo priorizar los casos de riesgo alto (`if_violate=0`) frente a los potenciales (`if_violate=1`) y los descartables (`if_violate=2`).
- **Generacion de remediaciones**: la explicacion incluye recomendaciones accionables de remediacion, util para redactar planes de accion tras una deteccion de incumplimiento.
- **Analisis multi-DPP**: el modelo puede detectar infracciones combinadas (por ejemplo, DPP4 + DPP1) en un mismo caso, lo que resulta util en investigaciones complejas que afectan a varios principios simultaneamente.
- **Procesamiento batch de formularios y politicas**: integrado con `vLLM`, puede procesar lotes de documentos en ingles o chino de Hong Kong para clasificar su conformidad con la ordenanza, manteniendo la pureza de script en la salida.
- **Sustitucion de modelos internos**: al ser un reemplazo directo de `UD_model_v4_explanation`, permite migrar sistemas existentes de explicacion de cumplimiento sin cambiar el esquema de salida.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card, medidos con `vLLM` en decodificacion greedy (`temperature=0.0`, `repetition_penalty=1.05`) sobre una RTX 3090:

| Benchmark | `UD_model_v4_explanation` | `Kestrel-Explainer-4B` |
|---|---|---|
| `dev_90` (90 dossiers empresariales) | — | 85,17 (Band B) · 100 % JSON · 87/90 DPP4 · 0 fugas · 0/60 ZH mixto |
| `locked_910` (910 casos ciegos) | 56,46 (Band C, set de 1K) · 22/1000 DPP4 | 85,16 (Band B) · 100 % JSON (910/910) · 880/910 (96,7 %) DPP4 · 0 fugas · 3/606 (0,5 %) ZH mixto |
| Multi-DPP Grounding (DPP4+DPP1) | Parcial | 100,0 % (90/90 dev, 910/910 locked) |
| `diverse_300` (5 estratos de formato) | — | 100,0 % JSON · 100,0 % Acc (300/300) · 100,0 % Recall · 0 fugas · 0/200 ZH mixto |
| Tasa de falsos positivos en negativos duros | 100,0 % | 0,0 % (0/75) · Sanity 6/6 limpio |

El autor senala que el parser legado `normalize_v4_case` de `proxy_scorer.py` tiene un techo teorico de 88,75 para descripciones naturales sin punteros, porque otorga credito a etiquetas internas `[Fxx:field]`. Aun con ese techo, Kestrel-Explainer-4B alcanza 85,16 con `D5 = 9,5/10`, 0 ecos literales de PII y 0 errores de etiqueta, texto, consentimiento o DPP6 en los 1.306 casos evaluados.

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: los pesos en `bfloat16` ocupan 7,6 GB, por lo que se necesitan al menos 8 GB de VRAM para cargar el modelo, mas el espacio para el contexto y el KV cache. Con `max_model_len=4096` conviene disponer de 10–12 GB.
- **GPU recomendadas**: el autor reporta mediciones en una RTX 3090. Tambien son adecuadas A100, H100, L40S y RTX 4090.
- **Consumer GPU**: cabe en GPUs de consumo con 12 GB o mas de VRAM (RTX 3090, RTX 4090, RTX 4080). En GPUs de 8 GB puede requerir cuantizacion, aunque no se documentan pesos cuantizados publicados.
- **Opciones de despliegue**: `transformers` (con `device_map="auto"` y `torch_dtype=torch.bfloat16`) y `vLLM` (`dtype="bfloat16"`, `max_model_len=4096`). No se documentan recetas para llama.cpp, Ollama ni TGI.
- **Latencia y throughput**: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Kestrel-Explainer-4B | 4.022 M | No disponible (ejemplos a 4096) | Apache 2.0 | Cumplimiento Cap. 486 (HK) | Hugging Face |
| `UD_model_v4_explanation` | No disponible | No disponible | No disponible | Cumplimiento Cap. 486 (HK) | Interno (referencia de comparacion en la model card) |
| Qwen/Qwen3-4B (modelo base) | 4.000 M aprox. | No disponible | Apache 2.0 | Proposito general | Hugging Face |

La comparativa se limita a los modelos mencionados en la informacion proporcionada. No se dispone de datos de benchmarks estandar para comparar con alternativas de proposito general de la misma categoria.

## Limitaciones y advertencias

- **Dominio restringido**: el modelo esta especializado exclusivamente en la Cap. 486 de Hong Kong; su uso fuera de ese marco normativo no esta validado.
- **Idiomas limitados**: solo soporta ingles y chino (tradicional y simplificado de Hong Kong). No se documenta soporte para castellano ni otros idiomas.
- **Riesgo de alucinacion juridica**: aunque el modelo cita secciones estatutarias, no se garantiza que las citas sean correctas en todos los casos; requiere revision por parte de un profesional cualificado.
- **Pureza de script**: en el benchmark `locked_910` se observo un 0,5 % (3/606) de mezcla ZH/EN en la salida, lo que puede requerir post-procesado en produccion.
- **Dependencia de un system prompt**: los ejemplos de uso requieren cargar un `system_prompt.txt` externo; sin el, el formato de salida JSON puede no garantizarse.
- **Sesgos**: no se documentan evaluaciones de sesgo en la informacion proporcionada.
- **Licencia**: Apache 2.0 permite uso comercial, pero el modelo base Qwen3-4B tiene sus propias condiciones que deben verificarse.
- **Madurez**: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en noviembre de 2026; no hay evidencia de uso en produccion por terceros.
- **Caveat de evaluacion**: los benchmarks son internos del autor y miden el ajuste al esquema de salida y al parser `proxy_scorer.py`, no capacidades generales de razonamiento.

## Enlaces

- Hugging Face: https://huggingface.co/udomain/kestrel-explainer-4b
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- No se han encontrado en la busqueda web papers, blogs, repositorios ni demos adicionales en la informacion proporcionada.
