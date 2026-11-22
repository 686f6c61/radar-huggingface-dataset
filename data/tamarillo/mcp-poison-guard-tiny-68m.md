# Tamarillo/mcp-poison-guard-tiny-68m

## Resumen

Tamarillo MCP-Poison-Guard Tiny es un clasificador de texto encoder-only de 68,4 millones de parámetros, afinado a partir de `jhu-clsp/ettin-encoder-68m`, cuyo objetivo es detectar definiciones de herramientas MCP (Model Context Protocol) maliciosas antes de que se registren en un agente o pasarela corporativa. Resuelve un problema muy concreto del ecosistema de agentes: el envenenamiento de herramientas (*tool poisoning*), las instrucciones ocultas, la exfiltración de credenciales, la manipulación entre herramientas, el *tool shadowing* y los cambios maliciosos posteriores a la aprobación (*rug-pull*).

Se trata de un modelo de clasificación multietiqueta con seis cabezas de salida independientes, entrenado exclusivamente con descripciones y servidores disjuntos de los conjuntos de evaluación `toolguard-bench` y `MCPTox`, lo que permite medir la generalización real. Su gran ventaja es el coste: al tener solo 68 M de parámetros y licencia Apache-2.0, puede ejecutarse localmente en CPU o GPU modesta con latencias de decenas de milisegundos, integrándose en un pipeline de CI/CD o en un *gateway* MCP sin depender de APIs externas.

Es relevante ahora porque la adopción de MCP en entornos como Claude Code, Cursor o Windsurf ha multiplicado la superficie de ataque basada en metadatos de herramientas, y las soluciones existentes o bien son reglas léxicas frágiles o bien modelos de prompt injection de propósito general que no cubren las categorías específicas de MCP. Este modelo cubre esas categorías con un coste computacional mínimo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (ModernBERT, base `jhu-clsp/ettin-encoder-68m`) |
| Parametros totales | 68.410.374 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens (truncación indicada en el ejemplo de uso) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el autor no documenta cuantizaciones) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Cabezas de salida | 6 (multietiqueta): `poisoned`, `hidden_instruction`, `data_exfiltration`, `cross_tool_manipulation`, `shadowing`, `rug_pull` |
| Pipeline | text-classification |
| Tamaño del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

El modelo es un encoder ModernBERT de 68 M de parámetros, derivado de `jhu-clsp/ettin-encoder-68m`, con una cabeza de clasificación multietiqueta de seis salidas. Cada cabeza detecta una categoría de riesgo distinta: riesgo global (`poisoned`), instrucciones ocultas, exfiltración de datos, manipulación entre herramientas, suplantación (*shadowing*) y deriva maliciosa respecto a una versión previamente aprobada (`rug_pull`). El autor incluye un `thresholds.json` con umbrales calibrados por cabeza.

El entrenamiento se construyó a partir de pools disjuntos por servidor y descripción, usando `AgenticResourceDiscovery/verified-mcp-tools` (CC-BY-4.0) y excluyendo el 100 % de los servidores y descripciones presentes en `toolguard-bench` y `MCPTox`. Los checkpoints y umbrales se seleccionaron sobre un conjunto de validación disjunto por servidor (`val_strict` y `val_bal`). No se documenta en la información disponible el número exacto de tokens de entrenamiento ni si se aplicaron técnicas de RLHF o DPO; al ser un encoder de clasificación, no procede RLHF en el sentido de alineamiento generativo.

La innovación técnica principal no está en la arquitectura, sino en el diseño del benchmark y en la separación estricta entre entrenamiento y evaluación, que permite reportar tasas de falsos positivos realistas y una tasa de *steering flag* del 0,0 % en `toolguard-bench`.

## Capacidades

- Clasificación multietiqueta de definiciones de herramientas MCP con seis cabezas independientes.
- Detección de instrucciones ocultas o encubiertas que suprimen salvaguardas o engañan al usuario.
- Detección de exfiltración de datos: lectura o fuga encubierta de credenciales locales, `.env`, claves SSH o historial de chat.
- Detección de manipulación entre herramientas (*cross-tool manipulation*): instrucciones que secuestran o se apoyan en herramientas vecinas del registro.
- Detección de *shadowing*: herramientas impostoras o *typosquatting* que sobrescriben herramientas legítimas registradas.
- Detección de *rug-pull*: comparación de comportamiento malicioso frente a una versión previamente aprobada.
- Salida de puntuaciones de riesgo calibradas mediante `thresholds.json`.
- Integración como escáner CLI (`tamarillo_mcp_scan.py`) con código de salida 2 si alguna herramienta se marca como envenenada, apto para CI/CD.
- Uso vía `transformers` (`AutoModelForSequenceClassification`) y compatible con Text Embeddings Inference y endpoints.
- Capacidades multilingües: no, solo inglés.
- Capacidades de generación, razonamiento, código, matemáticas, visión o audio: no, es un clasificador.

## Casos de uso

- **Puerta de admisión en pasarelas MCP corporativas**: antes de registrar una herramienta en un *gateway* MCP, se envía la definición (`tools/list`) al clasificador y se rechaza la herramienta si la cabeza `poisoned` supera el umbral calibrado. La latencia de 26,1 ms p50 en A100 con batch=1 permite hacerlo en línea sin degradar la experiencia.
- **Integración en CI/CD para servidores MCP propios**: el script `tamarillo_mcp_scan.py` se ejecuta sobre el JSON de `tools/list` y devuelve código de salida 2 si detecta envenenamiento, bloqueando el despliegue de un servidor MCP comprometido en la pipeline.
- **Protección frente a *rug-pull* en producción**: se compara la definición actual de cada herramienta con la versión previamente aprobada y se activa la cabeza `rug_pull` ante deriva de comportamiento, lo que permite alertar cuando un servidor MCP cambia sus descripciones tras la auditoría inicial.
- **Detección de exfiltración de credenciales en asistentes de código**: en entornos como Claude Code o Cursor, el clasificador marca descripciones que instruyen al modelo a leer `~/.ssh/id_rsa`, `~/.aws/credentials` o `.env` y enviarlos en metadatos; la cabeza `data_exfiltration` alcanza un 75,0 % de marcado en `toolguard-bench`.
- **Auditoría de catálogos de herramientas de terceros**: se puede pasar un catálogo completo de herramientas de un marketplace MCP por el modelo para priorizar revisiones manuales, usando las puntuaciones por cabeza como ranking de riesgo.
- **Filtrado de *shadowing* en registros compartidos**: al detectar nombres sospechosamente similares a herramientas legítimas, la cabeza `shadowing` permite bloquear impostores antes de que un agente los invoque por error.
- **Evaluación de investigación en seguridad de agentes**: al ser Apache-2.0 y pequeño, sirve como línea base reproducible para comparar defensas contra envenenamiento de herramientas en artículos y experimentos.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados de forma independiente). Evaluación sobre conjuntos de test sin solapamiento con entrenamiento.

| Modelo | Params | Licencia | Cabezas | `toolguard-bench` Det / FAR / F1 / AUC | `MCPTox` Det / FAR / F1 / AUC |
|---|---:|---|---:|---|---|
| Keyword Rules | reglas | — | 1 | 4,2 % / 0,3 % / 0,080 / 0,519 | 9,1 % / 0,0 % / 0,166 / 0,545 |
| `wso2/tool-poisoning-detection` (reportado) | 110 M | Apache-2.0 | 1 | FAR 43,6 % | — |
| `protectai/deberta-v3-base-pi-v2` | 184 M | Apache-2.0 | 1 | 2,1 % / 0,7 % / 0,040 / 0,704 | 4,3 % / 1,4 % / 0,082 / 0,908 |
| `Horizon-Labs/prompt-injection-guard-base` | 307 M | Apache-2.0 | 1 | 26,4 % / 0,3 % / 0,415 / 0,862 | 45,0 % / 0,0 % / 0,620 / 0,969 |
| `Horizon-Labs/prompt-injection-guard-small` | 141 M | Apache-2.0 | 1 | 63,2 % / 4,6 % / 0,731 / 0,890 | 90,5 % / 1,1 % / 0,946 / 0,992 |
| **`Tamarillo/mcp-poison-guard-tiny-68m`** (`val_strict`) | **68 M** | **Apache-2.0** | **6** | **54,9 % / 1,0 % / 0,699 / 0,843** | 47,8 % / 9,7 % / 0,617 / 0,636 |
| `Tamarillo/mcp-poison-guard-base-300m` (`val_bal`) | 307 M | Apache-2.0 | 6 | 70,8 % / 2,3 % / 0,806 / 0,891 | 77,5 % / 2,8 % / 0,863 / 0,906 |
| `Tamarillo/mcp-poison-guard-base-300m` (`val_strict`) | 307 M | Apache-2.0 | 6 | 75,0 % / 3,6 % / 0,821 / 0,891 | 83,1 % / 8,6 % / 0,877 / 0,906 |
| Referencia publicada: `CharanSripadi/toolguard-1b` | 1.000 M | Gemma | 1 | 82,6 % / 1,6 % (1,8–2,3 s en CPU) | 81,6 % / 4,7 % |

Desglose por slice en `toolguard-bench` (449 elementos, `val_strict`):

| Slice | Elementos | Marcados | Tasa |
|---|---:|---:|---:|
| `clean_benign_update` | 28 | 2 | 7,1 % |
| `clean_hard` | 127 | 0 | 0,0 % |
| `clean_random` | 150 | 1 | 0,7 % |
| `cross_tool_manipulation` | 36 | 9 | 25,0 % |
| `data_exfiltration` | 36 | 27 | 75,0 % |
| `hidden_instruction` | 36 | 23 | 63,9 % |
| `rug_pull` | 18 | 14 | 77,8 % |
| `shadowing` | 18 | 6 | 33,3 % |

Desglose por slice en `MCPTox` (847 elementos):

| Slice | Elementos | Marcados | Tasa |
|---|---:|---:|---:|
| `Template-1` | 77 | 25 | 32,5 % |
| `Template-2` | 183 | 59 | 32,2 % |
| `Template-3` | 225 | 148 | 65,8 % |
| `clean_clean` | 362 | 35 | 9,7 % |

Latencia declarada: 26,1 ms p50 en GPU A100 con bf16 y batch=1.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 140 MB en fp32 (68,4 M de parámetros × 4 bytes), aproximadamente 70 MB en fp16/bf16. Cabe holgadamente en cualquier GPU, incluida una iGPU.
- GPU recomendadas: A100 para la latencia declarada de 26,1 ms p50 en bf16; cualquier RTX 4090, RTX 3090, RTX 4060 o incluso GPU integrada es suficiente por tamaño. El modelo también funciona en CPU.
- Cabe en GPU de consumo: sí, en todas las GPU de consumo modernas e incluso en CPU sin problemas, dado su tamaño de 0,1 GB.
- Opciones de despliegue: `transformers` (ejemplo oficial), Text Embeddings Inference (etiqueta `text-embeddings-inference`), endpoints compatibles, y el CLI `tamarillo_mcp_scan.py` incluido en el repositorio. No se documenta soporte explícito de vLLM, llama.cpp u Ollama para este modelo.
- Latencia y throughput: 26,1 ms p50 en A100 con bf16 y batch=1. El throughput no se documenta; por tamaño, se espera un throughput alto en GPU y varios cientos de inferencias por segundo en CPU con batching.

## Comparativa con modelos similares

| Aspecto | `Tamarillo/mcp-poison-guard-tiny-68m` | `Horizon-Labs/prompt-injection-guard-small` | `protectai/deberta-v3-base-pi-v2` | `CharanSripadi/toolguard-1b` |
|---|---|---|---|---|
| Parámetros | 68 M | 141 M | 184 M | 1.000 M |
| Licencia | Apache-2.0 | Apache-2.0 | Apache-2.0 | Gemma |
| Cabezas | 6 (multietiqueta MCP) | 1 | 1 | 1 |
| `toolguard-bench` F1 | 0,699 | 0,731 | 0,040 | no disponible en F1 (Det 82,6 %, FAR 1,6 %) |
| `MCPTox` F1 | 0,617 | 0,946 | 0,082 | no disponible en F1 (Det 81,6 %, FAR 4,7 %) |
| Latencia | 26,1 ms p50 (A100, bf16) | no disponible | no disponible | 1,8–2,3 s en CPU |
| Especialización | Categorías MCP específicas | Prompt injection genérica | Prompt injection genérica | Detección de envenenamiento MCP |

El modelo *small* de Horizon-Labs obtiene mejores cifras globales en ambos benchmarks, pero con una sola cabeza y sin granularidad por categoría MCP. El modelo tiny destaca por su granularidad de seis cabezas, su menor tamaño y su latencia mucho menor que la alternativa de 1B, a costa de menor detección global.

## Limitaciones y advertencias

- Solo soporta inglés; las descripciones de herramientas en otros idiomas pueden degradar la detección.
- El rendimiento en `MCPTox` es notablemente inferior al de `toolguard-bench` (F1 0,617 frente a 0,699; AUC 0,636 frente a 0,843), con una tasa de falsos positivos del 9,7 % en `MCPTox`, lo que puede generar ruido en producción.
- La detección de `cross_tool_manipulation` (25,0 %) y `shadowing` (33,3 %) es baja; no debe usarse como única defensa para esas categorías.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí de falsos positivos y falsos negativos en la clasificación.
- Los resultados de los benchmarks están declarados por el autor y no han sido verificados de forma independiente.
- El modelo fue creado y actualizado el 21 de noviembre de 2026, con 0 descargas y 0 *likes* en el momento de la consulta; no hay evidencia de uso en producción por terceros.
- Licencia Apache-2.0 permite uso comercial, pero conviene revisar las licencias de los datos de entrenamiento (`AgenticResourceDiscovery/verified-mcp-tools`, CC-BY-4.0).
- No se documentan sesgos específicos ni evaluación de robustez frente a ataques adversariales dirigidos al propio clasificador.
- El contexto de 2.048 tokens puede truncar definiciones de herramientas MCP muy largas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Tamarillo/mcp-poison-guard-tiny-68m
- Demo interactiva: https://huggingface.co/spaces/Tamarillo/mcp-poison-guard-demo
- Modelo base: https://huggingface.co/jhu-clsp/ettin-encoder-68m
- Dataset de evaluación `toolguard-bench`: https://huggingface.co/datasets/CharanSripadi/toolguard-bench
- Referencia publicada `CharanSripadi/toolguard-1b`: no disponible como enlace directo en la información proporcionada
- Paper MCPTox (AAAI 2026): no disponible como enlace directo en la información proporcionada
- Dataset de entrenamiento `AgenticResourceDiscovery/verified-mcp-tools`: no disponible como enlace directo en la información proporcionada
