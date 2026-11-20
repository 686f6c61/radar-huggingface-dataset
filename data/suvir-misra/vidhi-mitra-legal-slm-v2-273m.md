# Suvir-Misra/Vidhi-Mitra-Legal-SLM-v2-273M

## Resumen

Vidhi-Mitra (विधि-मित्र) Legal SLM v2 es un modelo de lenguaje pequeno (SLM) de 273,1 millones de parametros entrenado desde cero por el autor independiente Suvir-Misra, especializado en derecho indio y fiscalidad indirecta. Se construye sobre una arquitectura causal de estilo Llama con normalizacion RMSNorm, activacion SwiGLU, embeddings atados y una ventana de contexto de 2.048 tokens, ampliada respecto a versiones anteriores mediante un valor de RoPE theta de 20.000,0.

El modelo cubre multiples dominios del ordenamiento juridico indio: GST e impuestos indirectos (CGST, IGST, UTGST, SGST, aduanas y impuesto especial central), impuesto sobre la renta (Ley de 1961, regimen por defecto de la seccion 115BAC, ganancias de capital, TDS), derecho penal y procesal (BNSS 2023, BNS), derecho de sociedades y valores (SEBI LODR), delitos economicos (PMLA 2002) y jurisprudencia de tribunales (CESTAT y GSTAT). Incorpora ademas actualizaciones normativas y precedentes judiciales de 2025-2026, como el regimen unificado de requerimiento de la seccion 74A del CGST y la amnistia condicional de la seccion 128A.

Su rasgo diferencial es la capacidad agentica nativa: el modelo emite invocaciones estructuradas de herramientas (fecha y hora del sistema, calculo de intereses fiscales, ejecucion de Python y busqueda web con consentimiento explicito del usuario) y mantiene memoria conversacional multi-turno dentro de su ventana de 2.048 tokens. Se distribuye bajo licencia Apache 2.0, lo que facilita su adopcion comercial, y esta pensado para despliegues ligeros donde un modelo de este tamano puede ejecutarse en hardware modesto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal de estilo Llama (RMSNorm, SwiGLU, RoPE, embeddings atados) |
| Parametros totales | 273.115.136 (273,1 M) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | No disponible (la model card solo menciona float32 y bfloat16 para inferencia) |
| Idiomas soportados | Ingles (en) e hindi (hi) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers, PyTorch) |

Otras especificaciones de arquitectura declaradas por el autor:

| Atributo | Valor |
|---|---|
| Dimension oculta (n_embd) | 1.024 |
| Capas del transformer (n_layer) | 19 |
| Cabezas de atencion (n_head) | 16 (dimension por cabeza: 64) |
| Dimension intermedia FFN (ffn_hidden) | 2.752 (SwiGLU) |
| Base de frecuencia RoPE (rope_theta) | 20.000,0 |
| Vocabulario | 32.000 tokens SentencePiece + 256 slots de byte-fallback |
| Normalizacion | RMSNorm (epsilon = 1e-6) |
| Embeddings atados | Si (embed_tokens = lm_head) |
| Tamano del repositorio | 1,1 GB |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer causal densa de estilo Llama con 19 capas, dimension oculta de 1.024, 16 cabezas de atencion de 64 dimensiones cada una y una FFN con activacion SwiGLU de 2.752 dimensiones intermedias. Usa RMSNorm con epsilon de 1e-6, embeddings de entrada y salida atados y embeddings posicionales rotatorios con theta de 20.000,0, valor que el autor justifica para acomodar extractos estatutarios largos y dialogos multi-turno dentro de la ventana de 2.048 tokens. El tokenizador es SentencePiece con 32.000 tokens y 256 slots de byte-fallback.

El proceso de entrenamiento se describe como una progresion en cinco etapas: preentrenamiento desde cero sobre un corpus juridico y estatutario indio multi-dominio; ajuste supervisado (SFT) con cadenas de razonamiento IRAC (Issue, Rule, Analysis, Conclusion), seguimiento de turnos multi-turno y esquemas de herramientas; optimizacion de preferencias ORPO con pares generados por auto-juego que penalizan alucinaciones y fallos de sintaxis; ensamblado en el espacio de pesos WiSE-FT para preservar fluidez y fundamentacion estatutaria; y un reentrenamiento extendido a 2026 con ajuste de la herramienta de navegador con control de permisos. No se especifican en la informacion disponible el numero de tokens de entrenamiento ni la composicion exacta del dataset.

## Capacidades

- Generacion de texto y razonamiento juridico estructurado mediante cadenas IRAC explicitas dentro de etiquetas `<think>`.
- Cobertura multi-dominio del derecho indio: GST e impuestos indirectos, impuesto sobre la renta, BNSS/BNS, SEBI, PMLA y jurisprudencia de CESTAT/GSTAT.
- Conocimiento de enmiendas y precedentes de 2025-2026: seccion 74A del CGST, amnistia condicional de la seccion 128A, secciones 187 y 479 de la BNSS, doctrina de doble condicion de la seccion 45 de la PMLA armonizada con el articulo 21.
- Tool calling agentico con cuatro herramientas declaradas: `system_date_time()`, `calculate_interest_tax(tax_amount, days, rate)` para intereses del 18 % anual (seccion 50(1)) o 24 % anual (seccion 50(3)), `python_repl(code)` y `browser_search_and_summarize(query)`.
- Busqueda web con consentimiento explicito del usuario antes de abrir el navegador local o consultar motores de busqueda.
- Memoria conversacional multi-turno dentro de la ventana de 2.048 tokens.
- Capacidades multilingues limitadas a ingles y hindi.
- Calculo de intereses fiscales estatutarios y computacion matematica o algoritmica via ejecucion de Python.

## Casos de uso

- Asistencia en cumplimiento de GST: el modelo distingue el regimen unificado de requerimiento de la seccion 74A (ejercicio 2024-25 en adelante) de los procedimientos duales heredados de las secciones 73 y 74, y puede calcular intereses estatutarios del 18 % o 24 % anual invocando `calculate_interest_tax`.
- Consulta de derecho penal y procesal indio: resuelve dudas sobre la BNSS 2023, la BNS, la custodia policial de la seccion 187 y la liberacion de presos preventivos primerizos de la seccion 479, con cadenas IRAC que separan hechos, norma y conclusion.
- Analisis de delitos economicos y fianzas: evalua las condiciones duales de la seccion 45 de la PMLA frente a las garantias constitucionales del articulo 21 y los protocolos de detencion de la seccion 19, util para despachos que preparan escritos de fianza.
- Soporte a litigios ante tribunales: asiste en la interpretacion de las Reglas Generales de Interpretacion (GRI) y en la invocacion de la limitacion ampliada de la seccion 28(4) ante CESTAT y el GSTAT recien operativo.
- Cumplimiento de sociedades y valores: ayuda a redactar y revisar divulgaciones materiales bajo la regulacion 30 de SEBI LODR y a encuadrar supuestos de abuso de mercado o contratos de futuros y opciones.
- Automatizacion de atencion al contribuyente: al ser un modelo de 273 M con contexto de 2.048 tokens, puede desplegarse en entornos con recursos limitados para resolver consultas fiscales multi-turno con memoria conversacional y sin dependencia de APIs externas.
- Agente de investigacion juridica con control humano: la herramienta `browser_search_and_summarize` exige consentimiento explicito antes de consultar la web, lo que permite construir flujos donde el modelo solicita actualizaciones normativas en tiempo real y el operador las autoriza.
- Verificacion de calculos fiscales en pipelines internos: mediante `python_repl`, el modelo puede ejecutar comprobaciones aritmeticas o algoritmicas sobre importes, plazos e intereses antes de emitir una respuesta final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,1 GB en float32 (273 M de parametros) y en torno a 0,55 GB en bfloat16 o float16; la cuantizacion a 8 o 4 bits reduciria aun mas la huella, aunque el autor no publica pesos cuantizados.
- GPU recomendadas: cualquier GPU consumer moderna con al menos 2 GB de VRAM es suficiente para float32; tarjetas como RTX 3060, RTX 4060, RTX 4090 o superiores ofrecen margen amplio. En entornos de servidor, A100 o H100 no son necesarias para este tamano y solo tendrian sentido para servir muchas peticiones concurrentes.
- Cabe en GPU consumer: si, practicamente en cualquier GPU dedicada de los ultimos anos, e incluso en CPU para inferencia por lotes pequenos.
- Opciones de despliegue: transformers (referencia oficial de la model card), text-generation-inference (el modelo esta etiquetado como compatible con endpoints), y herramientas habituales del ecosistema como llama.cpp u Ollama si se generan pesos GGUF, aunque el autor no los publica.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Vidhi-Mitra Legal SLM v2 | 273,1 M | 2.048 tokens | Apache 2.0 | Derecho indio multi-dominio con tool calling agentico |
| Modelos legales genericos de ~7 B (p. ej. variantes de Llama o Mistral ajustadas) | ~7.000 M | 4.096-8.192 tokens | Variable (a menudo no comercial) | Derecho general, sin especializacion en derecho indio |
| SLM genericos de ~270-500 M (p. ej. Qwen2.5-0.5B, SmolLM2-360M) | 270-500 M | 2.048-32.768 tokens | Apache 2.0 o similar | Proposito general, sin conocimiento juridico especializado ni herramientas legales |

La comparativa cuantitativa de rendimiento no esta disponible: el autor no publica benchmarks que permitan contrastar el modelo con alternativas de la misma categoria. La principal ventaja diferencial declarada es la especializacion en derecho indio con actualizaciones de 2025-2026 y el soporte nativo de herramientas; la principal desventaja frente a modelos mayores es la ventana de contexto de 2.048 tokens y la menor capacidad de razonamiento general asociada a un tamano de 273 M.

## Limitaciones y advertencias

- Riesgo de alucinacion juridica: a pesar del ajuste ORPO que penaliza alucinaciones, un modelo de 273 M tiene capacidad limitada para verificar citas normativas y jurisprudenciales; toda salida debe ser revisada por un profesional cualificado.
- Ventana de contexto corta: 2.048 tokens limitan la cantidad de texto estatutario o historial conversacional que puede procesarse de una vez, lo que puede provocar perdida de informacion en casos complejos.
- Cobertura idiomatica restringida a ingles y hindi; no se declara soporte de otras lenguas oficiales de la India ni de castellano.
- Especializacion muy concreta en el ordenamiento indio: el modelo no es util para otras jurisdicciones y podria producir respuestas incorrectas si se le consulta sobre derecho de otros paises.
- No se han publicado resultados de benchmarks ni evaluaciones independientes, por lo que el rendimiento real en tareas juridicas no esta verificado.
- Ausencia de pesos cuantizados oficiales (GGUF, AWQ, GPTQ) en el repositorio, lo que obliga a generarlos si se desea un despliegue optimizado.
- El modelo no sustituye asesoramiento juridico profesional; su uso en produccion para decisiones legales o fiscales requiere supervision humana y validacion contra fuentes oficiales.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre la exactitud del contenido juridico generado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Suvir-Misra/Vidhi-Mitra-Legal-SLM-v2-273M
- Perfil del autor en Hugging Face: https://huggingface.co/Suvir-Misra
