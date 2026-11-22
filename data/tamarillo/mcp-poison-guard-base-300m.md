# Tamarillo/mcp-poison-guard-base-300m

## Resumen

Tamarillo MCP-Poison-Guard Base es un clasificador de seguridad de 307,5 millones de parámetros, construido sobre el modelo ModernBERT `Horizon-Labs/prompt-injection-guard-base`, especializado en detectar definiciones de herramientas MCP (Model Context Protocol) maliciosas antes de que se registren en agentes y gateways empresariales. Resuelve un problema concreto y creciente: los ataques de *tool poisoning*, en los que un servidor MCP publica una herramienta aparentemente legítima cuya descripción oculta instrucciones para el modelo, exfiltración de credenciales, manipulación de otras herramientas del registro o cambios de comportamiento tras una revisión (*rug-pull*).

Su aportación diferencial frente a clasificadores genéricos de prompt injection es una cabeza multi-etiqueta de seis salidas (`poisoned`, `hidden_instruction`, `data_exfiltration`, `cross_tool_manipulation`, `shadowing`, `rug_pull`), lo que permite no solo bloquear una herramienta sino clasificar el tipo de amenaza y aplicar políticas de mitigación diferenciadas. El modelo declara métricas sobre dos suites de test sin solapamiento con el entrenamiento: F1 de 0,806 y AUC de 0,891 en `toolguard-bench` (449 ítems), y F1 de 0,863 y AUC de 0,906 en `MCPTox` (847 ítems, AAAI 2026).

Con licencia Apache-2.0, 307,5 M de parámetros y una latencia declarada de 29,8 ms p50 en A100 con bf16 y batch=1, está pensado para ejecutarse localmente como guardrail en tiempo de registro de herramientas, integrándose en CI/CD o en pasarelas MCP corporativas sin depender de APIs externas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT), base `Horizon-Labs/prompt-injection-guard-base` |
| Parametros totales | 307.534.854 (307,5 M) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (la model card trunca con `max_length`; valor concreto no especificado) |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria `transformers`) |

## Arquitectura y entrenamiento

El modelo es un encoder tipo ModernBERT afinado para clasificacion de secuencias con seis cabezas de salida multi-etiqueta. Se parte del checkpoint `Horizon-Labs/prompt-injection-guard-base` (307 M, Apache-2.0), originalmente un clasificador binario de prompt injection, y se reentrena para producir seis puntuaciones independientes: riesgo global (`poisoned`), instrucciones ocultas, exfiltracion de datos, manipulacion cruzada entre herramientas, suplantacion (`shadowing`) y deriva maliciosa respecto a una version aprobada previa (`rug_pull`). El autor indica que se incluyen umbrales calibrados en un fichero `thresholds.json`.

El entrenamiento se construyo a partir de pools de servidores y descripciones disjuntos, usando `AgenticResourceDiscovery/verified-mcp-tools` (CC-BY-4.0) y excluyendo el 100 % de los servidores y descripciones presentes en `toolguard-bench` y `MCPTox`, lo que respalda la validez de las metricas sobre test. La seleccion de checkpoints y umbrales se hizo exclusivamente sobre un conjunto de validacion con servidores disjuntos. La model card no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplico RLHF/DPO (no aplicable en un clasificador de este tipo). Se ofrecen dos configuraciones de umbrales, `val_bal` y `val_strict`, con distinto equilibrio entre deteccion y falsos positivos.

## Capacidades

- Clasificacion multi-etiqueta de definiciones de herramientas MCP en seis dimensiones de riesgo independientes.
- Deteccion de instrucciones ocultas y supresion de seguridad en descripciones de herramientas (`hidden_instruction`).
- Deteccion de exfiltracion de credenciales, claves SSH, `.env` e historial de conversacion (`data_exfiltration`).
- Deteccion de manipulacion cruzada entre herramientas del mismo registro (`cross_tool_manipulation`).
- Deteccion de herramientas impostoras o typosquatting que suplantan herramientas legitimas (`shadowing`).
- Deteccion de *rug-pull*: comparacion del comportamiento declarado frente a una version aprobada previamente (`rug_pull`).
- Salida de puntuaciones calibradas con umbrales incluidos (`thresholds.json`), apta para politicas de bloqueo automatico.
- Capacidad de ejecucion local en CPU o GPU con la libreria `transformers` y script CLI incluido (`tamarillo_mcp_scan.py`) con codigo de salida 2 ante deteccion.
- Compatibilidad declarada con text-embeddings-inference y endpoints compatibles (tag `endpoints_compatible`).
- Solo ingles: no se declara soporte multilingue.
- No es un modelo generativo: no realiza tool calling, razonamiento multi-paso ni generacion de texto.

## Casos de uso

- **Guardrail en pasarelas MCP empresariales**: interceptar cada llamada `tools/list` de un servidor MCP y clasificar las definiciones antes de registrarlas en el catalogo del agente. La latencia de 29,8 ms p50 en A100 permite validar decenas de herramientas por peticion sin impacto perceptible en el arranque de la sesion.
- **Integracion en CI/CD para servidores MCP propios**: ejecutar `tamarillo_mcp_scan.py --fail-on-poisoned` sobre el JSON de `tools/list` en el pipeline, de modo que un cambio en una descripcion que introduzca instrucciones ocultas rompa la build antes de desplegar el servidor.
- **Proteccion frente a *rug-pull* en produccion**: almacenar la version aprobada de cada herramienta y reescanear ante cada actualizacion del servidor; la cabeza `rug_pull` detecta la deriva de comportamiento maliciosa aunque la nueva descripcion sea sintacticamente valida.
- **Auditoria de registros de herramientas de terceros**: procesar por lotes el catalogo completo de servidores MCP de un marketplace o de un cliente y priorizar la revision manual segun la puntuacion de `poisoned` y la etiqueta de amenaza detectada.
- **Defensa en profundidad en agentes de codigo (Claude Code, Cursor, Windsurf)**: desplegar el clasificador como paso previo local al registro de herramientas, complementando las salvaguardas del propio agente con una verificacion especifica de descripciones MCP.
- **Monitorizacion y telemetria de seguridad**: registrar las seis puntuaciones por herramienta para construir lineas base por servidor y detectar anomalias de comportamiento a lo largo del tiempo, con umbrales `val_bal` o `val_strict` segun la tolerancia a falsos positivos del entorno.
- **Filtrado de herramientas en entornos de investigacion sobre agentes**: usar el modelo para construir conjuntos de datos etiquetados por tipo de ataque y evaluar la robustez de otros agentes o defensas frente a tool poisoning.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados de forma independiente, `verified: false`) sobre suites de test sin solapamiento con el entrenamiento.

| Modelo | Parametros | Licencia | Cabezas | `toolguard-bench` Det / FAR / F1 / AUC | `MCPTox` Det / FAR / F1 / AUC |
|---|---:|---|---:|---|---|
| Keyword Rules | reglas | — | 1 | 4,2 % / 0,3 % / 0,080 / 0,519 | 9,1 % / 0,0 % / 0,166 / 0,545 |
| `wso2/tool-poisoning-detection` (reportado) | 110 M | Apache-2.0 | 1 | FAR 43,6 % | — |
| `protectai/deberta-v3-base-pi-v2` | 184 M | Apache-2.0 | 1 | 2,1 % / 0,7 % / 0,040 / 0,704 | 4,3 % / 1,4 % / 0,082 / 0,908 |
| `Horizon-Labs/prompt-injection-guard-base` | 307 M | Apache-2.0 | 1 | 26,4 % / 0,3 % / 0,415 / 0,862 | 45,0 % / 0,0 % / 0,620 / 0,969 |
| `Horizon-Labs/prompt-injection-guard-small` | 141 M | Apache-2.0 | 1 | 63,2 % / 4,6 % / 0,731 / 0,890 | 90,5 % / 1,1 % / 0,946 / 0,992 |
| `Tamarillo/mcp-poison-guard-tiny-68m` (`val_strict`) | 68 M | Apache-2.0 | 6 | 54,9 % / 1,0 % / 0,699 / 0,843 | 47,8 % / 9,7 % / 0,617 / 0,636 |
| **`Tamarillo/mcp-poison-guard-base-300m` (`val_bal`)** | **307 M** | **Apache-2.0** | **6** | **70,8 % / 2,3 % / 0,806 / 0,891** | **77,5 % / 2,8 % / 0,863 / 0,906** |
| **`Tamarillo/mcp-poison-guard-base-300m` (`val_strict`)** | **307 M** | **Apache-2.0** | **6** | **75,0 % / 3,6 % / 0,821 / 0,891** | **83,1 % / 8,6 % / 0,877 / 0,906** |
| `CharanSripadi/toolguard-1b` (referencia publicada) | 1.000 M | Gemma | 1 | 82,6 % / 1,6 % (1,8–2,3 s CPU) | 81,6 % / 4,7 % |

Desglose por segmento con umbrales `val_bal`:

| Suite | Segmento | Items | Marcados | Tasa |
|---|---|---:|---:|---:|
| `toolguard-bench` | `clean_benign_update` | 28 | 6 | 21,4 % |
| `toolguard-bench` | `clean_hard` | 127 | 1 | 0,8 % |
| `toolguard-bench` | `clean_random` | 150 | 0 | 0,0 % |
| `toolguard-bench` | `cross_tool_manipulation` | 36 | 21 | 58,3 % |
| `toolguard-bench` | `data_exfiltration` | 36 | 27 | 75,0 % |
| `toolguard-bench` | `hidden_instruction` | 36 | 32 | 88,9 % |
| `toolguard-bench` | `rug_pull` | 18 | 16 | 88,9 % |
| `toolguard-bench` | `shadowing` | 18 | 6 | 33,3 % |
| `MCPTox` | `Template-1` | 77 | 36 | 46,8 % |
| `MCPTox` | `Template-2` | 183 | 130 | 71,0 % |
| `MCPTox` | `Template-3` | 225 | 210 | 93,3 % |
| `MCPTox` | `clean_clean` | 362 | 10 | 2,8 % |

Latencia declarada: 29,8 ms p50 en GPU A100 con bf16 y batch=1.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 0,6–0,7 GB de pesos, mas activaciones y overhead del runtime; en la practica cabe en cualquier GPU con 2 GB o mas.
- Cabe en GPU de consumo: RTX 3060, RTX 4060, RTX 4090 y similares, con margen amplio. Tambien es viable en CPU para volumenes moderados, aunque la model card solo reporta latencia en A100.
- GPU recomendadas para produccion de alto throughput: A100, H100 o L4 para servir lotes de definiciones de herramientas; con batch mayor se aprovecha mejor el hardware.
- Opciones de despliegue: `transformers` (referencia en la model card), text-embeddings-inference y endpoints compatibles segun los tags del repositorio. No se documentan artefactos GGUF ni soporte explicito de llama.cpp u Ollama, por lo que la cuantizacion a 4/8 bits requeriria conversion propia.
- Latencia y throughput: 29,8 ms p50 por item en A100 bf16 batch=1; el throughput agregado con lotes mayores no se declara.
- El repositorio ocupa 0,6 GB, lo que facilita su empaquetado en imagenes de contenedor para guardrails desplegados junto al agente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---:|---|---|---|---|
| `Tamarillo/mcp-poison-guard-base-300m` | 307 M | No disponible | 6 cabezas multi-etiqueta especificas de MCP | Apache-2.0 | Hugging Face, demo Space, CLI incluido |
| `Tamarillo/mcp-poison-guard-tiny-68m` | 68 M | No disponible | 6 cabezas, version reducida | Apache-2.0 | Hugging Face |
| `Horizon-Labs/prompt-injection-guard-base` | 307 M | No disponible | 1 cabeza binaria de prompt injection | Apache-2.0 | Hugging Face |
| `protectai/deberta-v3-base-pi-v2` | 184 M | No disponible | 1 cabeza binaria de prompt injection | Apache-2.0 | Hugging Face |
| `CharanSripadi/toolguard-1b` | 1.000 M | No disponible | 1 cabeza, basado en Gemma | No disponible | Hugging Face |

El modelo base de 307 M ofrece mejor deteccion que el tiny de 68 M a costa de mayor latencia y huella; frente a los clasificadores binarios de prompt injection, la diferencia principal no es solo la deteccion sino la granularidad de las seis etiquetas. El `toolguard-1b` de referencia obtiene mayor deteccion en `toolguard-bench` (82,6 % frente a 75,0 % en `val_strict`) pero con un modelo tres veces mayor y latencias de 1,8–2,3 s en CPU.

## Limitaciones y advertencias

- Entrenado y evaluado solo en ingles; las descripciones de herramientas en castellano u otros idiomas pueden degradar la deteccion de forma no cuantificada.
- Las metricas son declaradas por el autor y no estan verificadas de forma independiente (`verified: false` en el model-index).
- La deteccion de `shadowing` es debil: 33,3 % en `toolguard-bench` con `val_bal`, lo que deja pasar dos tercios de las herramientas impostoras en ese segmento.
- `cross_tool_manipulation` tambien presenta recall limitado (58,3 % en `toolguard-bench`).
- Los ataques basados en plantillas poco representadas en el entrenamiento se detectan peor: `Template-1` de `MCPTox` solo alcanza un 46,8 % de marcado, frente al 93,3 % de `Template-3`.
- Tasa de falsos positivos no nula: 21,4 % en `clean_benign_update` y 2,8 % en `clean_clean` de `MCPTox`; con umbrales `val_strict` el FAR sube (8,6 % en `MCPTox`), lo que puede bloquear actualizaciones legitimas.
- Riesgo de falso negativo ante ataques novedosos que no compartan patrones con los pools de entrenamiento; no sustituye a una revision humana en entornos de alto riesgo.
- Es un clasificador, no un generador: no razona sobre la intencion de la herramienta ni ejecuta analisis dinamico del servidor MCP; solo evalua el texto de la definicion.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base y los datasets de evaluacion tienen sus propias condiciones (`AgenticResourceDiscovery/verified-mcp-tools` es CC-BY-4.0), que conviene revisar antes de redistribuir derivados.
- No se documentan artefactos cuantizados oficiales (GGUF, AWQ, GPTQ) ni longitud de contexto maxima; el truncado a `max_length` puede perder instrucciones situadas al final de descripciones muy largas.
- No hay resultados de benchmarks publicados por terceros ni informacion sobre sesgos mas alla de los datos de entrenamiento declarados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Tamarillo/mcp-poison-guard-base-300m
- Demo interactiva (Space): https://huggingface.co/spaces/Tamarillo/mcp-poison-guard-demo
- Modelo base: https://huggingface.co/Horizon-Labs/prompt-injection-guard-base
- Version reducida: https://huggingface.co/Tamarillo/mcp-poison-guard-tiny-68m
- Dataset de entrenamiento de referencia: https://huggingface.co/datasets/AgenticResourceDiscovery/verified-mcp-tools
- Benchmark `toolguard-bench`: https://huggingface.co/datasets/CharanSripadi/toolguard-bench
- Referencia publicada `toolguard-1b`: https://huggingface.co/CharanSripadi/toolguard-1b
- Clasificador binario comparable: https://huggingface.co/protectai/deberta-v3-base-pi-v2
- Clasificador de tool poisoning de WSO2: https://huggingface.co/wso2/tool-poisoning-detection
