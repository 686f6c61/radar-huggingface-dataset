# Veilance/Verity-14B-v1

## Resumen

Verity-14B-v1 es un adaptador de ajuste eficiente de parámetros (PEFT/LoRA) publicado por Veilance sobre el modelo base Qwen/Qwen3-14B. No es un modelo de propósito general: está especializado en una única tarea de análisis de privacidad, en la que compara el comportamiento observado en el navegador durante una visita concreta con el texto de una política de privacidad y emite un informe JSON estructurado con hallazgos y evidencia.

El modelo distingue explícitamente entre lo que la política *dice*, lo que el navegador *observó* y lo que puede *inferirse* al comparar ambas fuentes, asignando etiquetas como `matched`, `partially_matched`, `observed_only` o `possible_contradiction`. Sus conclusiones se plantean como pistas para revisión humana, no como determinaciones legales de incumplimiento.

Es relevante dentro del nicho de auditoría de privacidad web y análisis de telemetría, donde los flujos de cumplimiento normativo requieren salidas estructuradas y trazables. La ficha del autor se presenta explícitamente como un borrador y varios datos clave (protocolo de evaluación, licencia del adaptador, esquema de entrada definitivo) no están confirmados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-14B) con adaptador LoRA/PEFT |
| Parametros totales | 14B en el modelo base; parametros del adaptador no disponibles |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen/Qwen3-14B; no especificada en la ficha del adaptador) |
| Tipos de cuantizacion | No disponible (pesos del adaptador en safetensors) |
| Idiomas soportados | Ingles (en) |
| Licencia | No disponible (la licencia Apache-2.0 del modelo base no determina por si sola la del adaptador) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA; tamano de repo 0,5 GB) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA montado sobre Qwen/Qwen3-14B, un transformer decoder-only de aproximadamente 14.000 millones de parametros. Al tratarse de un PEFT, no se redistribuyen los pesos completos del modelo base: el repositorio de 0,5 GB contiene el adaptador, que debe combinarse con Qwen3-14B en tiempo de inferencia. Se indica que la inferencia se realiza en el modo no-thinking de Qwen3 (`enable_thinking=False`), es decir, sin la fase extendida de razonamiento del modelo base.

La model card no aporta detalles sobre el volumen de datos de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF o DPO. El único dato de rendimiento reportado es una precisión de tokens del 98 %, pero el autor reconoce que no se ha proporcionado el protocolo de evaluación, por lo que la cifra no es verificable con la información disponible. La ficha también advierte que se trata de un borrador y que la configuración final de la ejecución de 14B, el prompt y el esquema de salida deben confirmarse contra el checkpoint real.

## Capacidades

- Comparación entre telemetría de navegador y texto de política de privacidad, con emisión de informes en JSON estructurado.
- Clasificación mediante etiquetas de comparación definidas: `matched`, `partially_matched`, `policy_only`, `observed_only`, `possible_contradiction` e `indeterminate`.
- Análisis de señales observables en el navegador: cookies, almacenamiento local y de sesión, IndexedDB, hosts de terceros, clasificación de rastreadores, Canvas, WebGL, audio, características de dispositivo, WebRTC, permisos y service workers (sujeto a la recolección disponible en cada visita).
- Generación de informes con campos previstos como `analysis`, `domain`, `findings`, `important_limitations`, `privacy_policy` y `visit`, donde los hallazgos identifican el comportamiento observado, la evidencia de política relevante, la etiqueta y la base de la conclusión.
- Salida orientada a validación determinista por parte de la aplicación anfitriona (por ejemplo, coherencia entre `analysis.counts` y los hallazgos).
- Idioma: únicamente inglés.
- No soporta tool calling ni function calling, no navega por sitios web y no recupera políticas por sí mismo; esas funciones corresponden a la aplicación anfitriona.

## Casos de uso

- Auditoría de privacidad asistida: la aplicación recolecta la telemetría de una visita y el texto de la política aplicable, y el modelo genera un informe JSON que un revisor humano examina para localizar posibles discrepancias entre lo declarado y lo observado.
- Cumplimiento normativo previo a despliegue: equipos de producto pueden ejecutar el modelo sobre visitas de prueba para generar evidencia estructurada que alimente revisiones internas de cookies y rastreadores antes de publicar cambios.
- Monitorización continua de terceros: integrado en un pipeline que recopila telemetría periódicamente, el modelo produce informes comparables en el tiempo para detectar cambios en el comportamiento observado frente a una política estable.
- Enriquecimiento de herramientas de revisión legal: los campos `findings` y `possible_contradiction` permiten priorizar qué secciones de una política requieren lectura detallada por parte de un analista.
- Investigación académica sobre transparencia web: el modelo facilita clasificar de forma sistemática grandes conjuntos de pares telemetría-política y estudiar patrones de correspondencia o falta de especificidad.
- Detección de desajustes de granularidad: el modelo distingue entre políticas que describen una práctica de forma genérica y observaciones más específicas (etiqueta `partially_matched`), útil para evaluar la calidad de las divulgaciones.
- Filtrado previo en sistemas de gestión de consentimiento: los informes pueden alimentar paneles internos que señalen qué comportamientos observados carecen de divulgación suficientemente relevante en la política suministrada.
- Validación de pipelines de recolección: dado que el modelo depende de telemetría estructurada, sus salidas `indeterminate` ayudan a detectar entradas incompletas o políticas ausentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El único dato reportado es una precisión de tokens del 98 %, cuyo protocolo de evaluacion no ha sido suministrado.

| Metrica | Resultado | Notas |
|---|---|---|
| Precisión de tokens | 98 % | Protocolo de evaluación no suministrado; no verificable |
| Benchmarks de tarea (privacidad) | No disponible | El autor indica que no se han aportado resultados a nivel de tarea |
| MMLU / HumanEval / GSM8K | No disponible | No reportados |

## Requisitos de hardware

- El adaptador LoRA ocupa 0,5 GB, pero la inferencia requiere cargar el modelo base Qwen3-14B completo, por lo que los requisitos de VRAM son los del modelo base.
- Precisión FP16/BF16: en torno a 28 GB de VRAM (14B parametros a 2 bytes mas overhead de activaciones y KV cache).
- Cuantización INT8: en torno a 14-16 GB de VRAM.
- Cuantización de 4 bits (GPTQ/AWQ o GGUF Q4): en torno a 8-10 GB de VRAM.
- GPU de centro de datos: A100 (40/80 GB), H100 y equivalentes, con margen para FP16 y contextos largos.
- GPU de consumo: RTX 4090 (24 GB) y RTX 3090 (24 GB) permiten FP16 ajustado en contextos cortos y con comodidad en 8 y 4 bits; tarjetas de 16 GB pueden funcionar en 4 bits con contexto reducido.
- Despliegue: al ser un adaptador PEFT, requiere transformers junto con PEFT para combinar con el modelo base; vLLM soporta adaptadores LoRA y TGI también puede servirlo. Para llama.cpp u Ollama sería necesario convertir el modelo fusionado a GGUF, algo que no se proporciona en el repositorio.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos directamente comparables en la misma tarea (comparación de políticas de privacidad frente a telemetría de navegador). La comparación más próxima es con el propio modelo base y con alternativas genéricas de su misma escala, aunque no cubren la tarea especializada.

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Verity-14B-v1 | 14B (base) + LoRA | No disponible | Comparación política/telemetría con salida JSON | No disponible | Adaptador PEFT en HuggingFace |
| Qwen/Qwen3-14B | 14B | No disponible en la informacion proporcionada | Texto general | Apache-2.0 (modelo base) | Pesos completos en HuggingFace |
| Alternativas especializadas en análisis de privacidad | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- El propio autor indica que el modelo no debe usarse para emitir determinaciones legales, regulatorias o reputacionales de forma autónoma sobre una organización.
- Una observación breve no permite establecer el comportamiento de un sitio para cada usuario, cuenta, elección de consentimiento, dispositivo, región o momento temporal.
- El modelo no recupera políticas, no navega por sitios ni inspecciona cargas de red; la calidad de la salida depende de que la aplicación anfitriona aporte telemetría y política válidas.
- La precisión de tokens del 98 % se reporta sin protocolo de evaluación, por lo que no debe tomarse como una métrica verificada.
- La ficha se declara explícitamente como borrador: el tipo de artefacto, la licencia, el prompt, el esquema de salida y las estadísticas finales deben confirmarse contra el checkpoint real.
- La licencia del adaptador no está especificada, lo que genera incertidumbre sobre el uso comercial, pese a que el modelo base se distribuye bajo Apache-2.0.
- Soporte exclusivo de inglés: las políticas o telemetrías en otros idiomas quedan fuera de su alcance previsto.
- Como todo modelo generativo, existe riesgo de alucinación; por ello la salida está pensada para validación determinista por parte de la aplicación y revisión humana.
- Una política ausente o inutilizable debería conducir a un resultado `indeterminate`, no a afirmaciones de falta de divulgación; la ausencia de una mención en una política aplicable no equivale automáticamente a contradicción.
- El esquema de entrada de ejemplo proporcionado en la model card es sintético y no garantiza que la versión de 14B use exactamente esos nombres de campo anidados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Veilance/Verity-14B-v1
- Modelo base Qwen/Qwen3-14B: https://huggingface.co/Qwen/Qwen3-14B
- Paper, blog, repositorio o demo adicionales: no disponible en la información proporcionada.
