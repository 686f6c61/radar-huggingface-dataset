# ulamai/Ulam-1-Small

## Resumen

Ulam-1-Small es un modelo de razonamiento matemático de 3.086 millones de parámetros desarrollado por Ulam AI, una organización especializada en datasets de razonamiento y verificación formal con Lean 4. Se distribuye como un modelo Transformer causal independiente en formato BF16, construido sobre la línea Qwen2.5 (Qwen2.5-3B, Qwen2.5-Coder-3B) y el checkpoint intermedio WeiboAI/VibeThinker-3B, del que es un finetune. Su objetivo declarado es la exploración matemática y el razonamiento de tipo demostración, no la certificación formal de teoremas.

El modelo se entrenó con trayectorias de razonamiento verificadas (datasets `ulamai/verified-research-reasoning-trajectories` y `ulamai/verified-math-olympiad-trajectories`) y se seleccionó un checkpoint con DPO (Direct Preference Optimization) que prioriza un equilibrio entre rendimiento medio y seguridad en afirmaciones autodeclaradas. Soporta una configuración arquitectónica de contexto de 131.072 tokens, aunque la longitud servible depende de la memoria disponible. Su licencia MIT y su formato estándar safetensors lo hacen atractivo para integración en pipelines de investigación y desarrollo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2ForCausalLM (Transformer causal) |
| Parametros totales | 3.085.938.688 (3,086 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 131.072 tokens (configuración arquitectónica) |
| Tipos de cuantizacion | BF16 nativo; cuantizaciones adicionales no documentadas |
| Idiomas soportados | Inglés |
| Licencia | MIT |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

Ulam-1-Small es un modelo de lenguaje causal basado en la arquitectura Qwen2, implementado como `Qwen2ForCausalLM`. El linaje se remonta a Qwen2.5-3B y Qwen2.5-Coder-3B, con un checkpoint intermedio WeiboAI/VibeThinker-3B que sirvió como base para el finetune. El entrenamiento utilizó dos datasets propios de Ulam AI con trayectorias de razonamiento verificadas: uno orientado a razonamiento matemático de investigación y otro a problemas de olimpiadas. El checkpoint publicado (checkpoint 20 de DPO, con balance de prompts) se eligió por su mejor media ponderada en la auditoría ErdosBench y por una cola de riesgo más segura en afirmaciones fuertes, en lugar de maximizar el rendimiento en pruebas cerradas de olimpiadas (el checkpoint V-SAO 177 fue superior en SIMOBench). El modelo puede emitir delimitadores explícitos de razonamiento como ` thinking... response`, que deben ser parseados si la aplicación solo muestra la respuesta final.

## Capacidades

- Generación de texto y razonamiento matemático paso a paso, con capacidad de emitir cadenas de pensamiento explícitas.
- Generación de demostraciones matemáticas de estilo exploratorio, incluyendo problemas de álgebra, aritmética y razonamiento formal.
- Conversación multi-turno vía chat template estándar de Transformers.
- Razonamiento matemático de investigación, evaluado con juicios externos (ErdosBench).
- No se documenta soporte de tool calling, agentes, visión, audio ni otras modalidades; es un modelo puramente textual.

## Casos de uso

- Asistente de aprendizaje de matemáticas: puede explicar demostraciones de teoremas elementales (por ejemplo, la suma de los primeros n impares) con razonamiento paso a paso, útil para estudiantes que necesitan ver el proceso completo.
- Generación de borradores de demostraciones para revisión humana: investigadores pueden usarlo para explorar conjeturas y obtener esbozos de pruebas que luego verifican de forma independiente.
- Integración con verificadores formales Lean 4: dado el ecosistema UlamAI, el modelo puede alimentar pipelines que generan código Lean y lo verifican automáticamente, reduciendo alucinaciones mediante la comprobación mecánica.
- Chat educativo para problemas de olimpiadas: su entrenamiento en trayectorias de olimpiadas lo hace adecuado para resolver problemas de competición con explicaciones detalladas.
- Asistente de razonamiento para científicos: en contextos de investigación exploratoria, puede sugerir enfoques de prueba o contraejemplos que luego el experto evalúa.
- Generación de soluciones detalladas para problemas de álgebra y cálculo: su capacidad de razonamiento multi-paso permite descomponer problemas complejos en subpasos verificables.
- Prototipado de agentes de razonamiento matemático: al ser un modelo pequeño (3B) y con licencia MIT, es adecuado para experimentar con técnicas de prompting y generación de cadenas de pensamiento sin costes de licencia.

## Benchmarks y rendimiento

Los resultados declarados por el autor en la model card son los siguientes:

| Tarea | Dataset | Métrica | Valor |
|---|---|---|---|
| Generación de demostraciones matemáticas | SIMOBench auditoría itemizada primaria (126 problemas) | Puntuación de prueba itemizada (máximo 882) | 667 |
| Razonamiento matemático de investigación | ErdosBench auditoría con juez externo (226 ítems) | Media ponderada de calificaciones (A/B/C/D/F/M = 4/2.7/1.7/1/0/0) | 2.287 |

Estos resultados no están verificados de forma independiente por terceros. No se han publicado comparativas con otros modelos en la información disponible.

## Requisitos de hardware

- Los pesos BF16 del modelo ocupan aproximadamente 5,75 GiB; el estado del modelo, kernels CUDA, KV cache y contexto adicional requieren memoria extra.
- La validación oficial se realizó en una NVIDIA DGX Spark con GB10 y 121 GiB de memoria unificada visible.
- En GPUs consumer con 24 GB de VRAM (por ejemplo, RTX 4090) es factible cargar el modelo en BF16 con una ventana de contexto moderada (16K tokens), aunque no hay cifras oficiales de throughput.
- Opciones de despliegue documentadas: Transformers (carga nativa) y vLLM (compatible con `Qwen2ForCausalLM`). También es compatible con text-generation-inference (TGI) según las etiquetas del repositorio.
- La configuración arquitectónica de 131.072 tokens no implica que cualquier despliegue pueda servir esa longitud; se recomienda ajustar `--max-model-len` según la memoria disponible.
- No se proporcionan datos de latencia o throughput específicos.

## Comparativa con modelos similares

No se han publicado comparativas de rendimiento con otros modelos en la información disponible. A continuación se presentan características básicas de modelos comparables en tamaño:

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Ulam-1-Small | 3,086 B | 131.072 (arquitectónico) | MIT | Razonamiento matemático y demostraciones |
| Qwen2.5-3B | 3,09 B | 131.072 | Apache 2.0 | Modelo general multilingüe |
| WeiboAI/VibeThinker-3B | ~3 B | No disponible | No disponible | Razonamiento y pensamiento (base de Ulam-1-Small) |

No se dispone de datos de benchmarks comparativos entre estos modelos.

## Limitaciones y advertencias

- No es un sistema de certificación de teoremas: las afirmaciones fuertes, contraejemplos y demostraciones propuestas requieren revisión experta independiente.
- Puede emitir razonamiento explícito con delimitadores (` thinking... response`); las aplicaciones que solo exponen la respuesta final deben parsear o enrutar esos tramos explícitamente.
- La longitud de contexto de 131.072 tokens es arquitectónica; servirla completa requiere memoria muy elevada y no está garantizada en hardware consumer.
- Solo soporta inglés; no se documentan capacidades multilingües.
- Riesgo de alucinación en razonamiento matemático, especialmente en afirmaciones autodeclaradas como "fuertes" o "contraejemplos".
- Aunque la licencia del modelo es MIT, la cadena de linaje (Qwen2.5, VibeThinker) puede tener licencias propias; se recomienda revisar `NOTICE` y `provenance.json` del repositorio antes de uso comercial.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ulamai/Ulam-1-Small
- Informe técnico (whitepaper): https://huggingface.co/ulamai/Ulam-1-Small/blob/main/paper/Ulam-1-Small-whitepaper.pdf
- Recibos de evaluación: https://huggingface.co/ulamai/Ulam-1-Small/blob/v1.0.0/evaluation_results.json
- Repositorio GitHub de UlamAI (prover Lean 4): https://github.com/ulamai/ulamai
- Blog de UlamAI Prover: https://www.ulam.ai/ulamai-prover
- Sitio web de Ulam AI: https://www.ulam.ai/
