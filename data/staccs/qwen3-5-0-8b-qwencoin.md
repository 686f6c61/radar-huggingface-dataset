# staccs/Qwen3.5-0.8B-qwencoin

## Resumen

Qwen3.5-0.8B-qwencoin es un checkpoint derivado de Qwen/Qwen3.5-0.8B publicado por el usuario staccs en Hugging Face. No se trata de un modelo entrenado desde cero ni de un fine-tuning convencional: el autor ha fusionado en los pesos del modelo una "máquina de SHA-256" implementada como capas de circuito adicionales, de modo que el cálculo del hash se ejecuta dentro del propio flujo de tokens durante una llamada a `generate()`. El modelo conserva la arquitectura stock `Qwen3_5ForCausalLM` (sin código personalizado ni `trust_remote_code`) y declara en su plantilla de chat un conjunto de funciones orientadas a operar un nodo de una cadena derivada de Bitcoin denominada qwencoin.

El checkpoint tiene 2.175.833.760 parámetros según los safetensors del repositorio (4,4 GB), con una dimensión oculta ampliada de 1024 a 2240 y cinco capas de circuito antepuestas a las capas de Qwen. La relevancia de este modelo es fundamentalmente experimental: demuestra que es posible incrustar un circuito lógico determinista (SHA-256) en los pesos de un transformer pequeño y hacer que el propio modelo lo ejecute token a token, además de servir como interfaz conversacional para las operaciones de una cadena de bloques con ordinales y un grafo de identidad con staking.

Conviene subrayar que el modelo no ha sido entrenado: el autor indica explícitamente "Nothing was trained". Se trata, por tanto, de una construcción de ingeniería de pesos más que de un modelo de lenguaje con capacidades nuevas aprendidas. Su interés es demostrativo y de nicho (criptomonedas, verificación de hashes, agentes sobre nodos), no un sustituto generalista de modelos de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (`Qwen3_5ForCausalLM`) con 5 capas de circuito SHA-256 antepuestas; hidden 1024 ampliado a 2240 |
| Parametros totales | 2.175.833.760 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio publica pesos en safetensors; el ejemplo de uso emplea `torch.bfloat16`) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-0.8B, un transformer decoder-only de la familia Qwen3.5, y le antepone cinco capas de circuito que implementan SHA-256. La dimensión oculta se amplía de 1024 a 2240 para acomodar el circuito, y los tokens del mismo se asignan a partir del id 248320 (`CHIP = 248320`). El resultado sigue siendo un `Qwen3_5ForCausalLM` estándar cargable con `transformers`, sin necesidad de código remoto. La fusión se realizó mediante un proceso de merge de pesos, no de entrenamiento: el autor afirma que no se entrenó nada y que el hash se calcula con los pesos dentro de la misma llamada a `generate()`.

Según las mediciones del autor en `tests/check_merge.py`, el circuito reproduce SHA-256 con cero errores en las trazas evaluadas: 457 posiciones para la cadena "abc" (un bloque), 898 posiciones para 70 bytes (dos bloques), 457 posiciones tras un prefijo de chat de 1981 tokens de texto, y 1339 posiciones tras 88 tokens de prosa y 121 bytes (tres bloques). En todos los casos el token ganador se sitúa en el rango 72..72 y el segundo candidato alcanza como máximo 0,889 de su valor. No se dispone de información sobre datos de entrenamiento, composición del dataset ni uso de RLHF/DPO, ya que el modelo no fue entrenado.

## Capacidades

- Generación de texto conversacional multi-turno heredada de Qwen3.5-0.8B.
- Cálculo nativo de SHA-256 dentro del flujo de tokens: el modelo emite `<tool_call>` para `sha256`, el circuito consume 457 tokens (un bloque) y devuelve `<tool_response>` con el digest en 64 dígitos hexadecimales.
- Tool calling declarado en la plantilla de chat cuando el llamador no pasa `tools`: incluye `sha256`, `chain_status`, `chain_block`, `chain_tx`, `wallet_balance`, `wallet_address`, `wallet_send`, `wallet_history`, `ord_inscribe`, `ord_read`, `ord_list`, `ord_send`, `ord_latest`, `graph_me`, `graph_bond`, `graph_vouch`, `graph_post`, `graph_feed`, `graph_who`, `graph_audit`, `graph_leave`, `bitcoin_cli` y `ord_cli`.
- Operación de nodo qwencoin: consulta de altura, tip, dificultad y pares; envío de pagos en sats; inscripción y transferencia de ordinales; staking y vouch en un grafo de identidad con slashing.
- Decodificación greedy con reglas de parada estándar de Qwen.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking, visión o audio: no disponibles.

## Casos de uso

- Verificación de hashes en pipelines de integridad: el modelo puede calcular SHA-256 de cadenas de bytes directamente en su flujo de tokens, lo que permite integrarlo en flujos de validación de artefactos sin llamar a una herramienta externa, siempre que se acepte la latencia de 457 tokens por bloque.
- Interfaz conversacional para un nodo de cadena: con un nodo qwencoin desplegado (Linux x86-64 o Windows vía WSL2), el modelo puede consultar estado de cadena, bloques y transacciones mediante las funciones declaradas, actuando como capa de lenguaje sobre `qwencoin-cli`.
- Gestión de wallet asistida: consulta de balance, generación de direcciones y envío de pagos en sats a través de `wallet_balance`, `wallet_address` y `wallet_send`, con el modelo traduciendo instrucciones en lenguaje natural a llamadas de herramienta.
- Publicación y lectura de ordinales: inscripción de texto en la cadena (`ord_inscribe`), lectura de inscripciones (`ord_read`), listado de las propias (`ord_list`) y transferencia (`ord_send`), útil para experimentos de contenido on-chain.
- Experimentación con grafos de identidad y staking: publicación de mensajes firmados (`graph_post`), consulta de reputación (`graph_who`), auditoría de reclamaciones (`graph_audit`) y bloqueo de stake (`graph_bond`, `graph_vouch`), orientado a prototipos de identidad con slashing.
- Investigación sobre circuitos en pesos: el checkpoint sirve como banco de pruebas para estudiar cómo un transformer pequeño ejecuta un algoritmo determinista incrustado, comparando trazas teacher-forced y free-running con la referencia.
- Docencia y demostraciones: ejemplo reproducible de merge de pesos y de tool calling declarado en plantilla de chat, sin código personalizado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor únicamente reporta mediciones del circuito SHA-256 en `tests/check_merge.py`:

| Prueba | Posiciones | Propiedad del circuito | Errores | Ganador | Segundo candidato |
|---|---|---|---|---|---|
| Traza pura, "abc" | 457 | 457 | 0 | 72..72 | ≤ 0,889 |
| Traza pura, 70 bytes (2 bloques) | 898 | 898 | 0 | 72..72 | ≤ 0,889 |
| Tras prefijo de chat de 1981 tokens | 457 | 457 | 0 | 72..72 | ≤ 0,889 |
| Tras 88 tokens de prosa, 121 bytes (3 bloques) | 1339 | 1339 | 0 | 72..72 | ≤ 0,889 |

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 4,4 GB en safetensors; en `bfloat16` la inferencia requiere aproximadamente 4,4 GB solo para pesos, más memoria para caché KV y activaciones. En cuantizaciones de 8 o 4 bits el requisito bajaría, pero no se publican ficheros GGUF ni cuantizaciones en el repositorio.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, el modelo es apto para GPU de consumo con al menos 8 GB de VRAM en `bfloat16`, aunque esta estimación no está confirmada por el autor.
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño de 2,18B parámetros y 4,4 GB de pesos, pero no hay confirmación oficial.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM` y `AutoTokenizer` (ejemplo oficial del autor); el autor menciona `endpoints_compatible` en los tags. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. El cálculo de un bloque SHA-256 consume 457 tokens del circuito, lo que condiciona la latencia por hash.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Capacidad diferencial | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| staccs/Qwen3.5-0.8B-qwencoin | 2,18B | no disponible | SHA-256 en pesos + tool calling de nodo qwencoin | apache-2.0 | Hugging Face |
| Qwen/Qwen3.5-0.8B (base) | no disponible en la información | no disponible | Modelo base de texto | no disponible en la información | Hugging Face |
| Modelos comparables de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de modelos alternativos comparables en la información proporcionada, por lo que la comparativa de rendimiento no está disponible.

## Limitaciones y advertencias

- El modelo no ha sido entrenado: las capacidades de lenguaje provienen íntegramente de Qwen3.5-0.8B y el circuito SHA-256 es una construcción de merge de pesos, no un comportamiento aprendido.
- Riesgo de alucinación: al ser un modelo de 0,8B de base, es propenso a errores en razonamiento abierto y en el uso de herramientas fuera de las trazas verificadas.
- El cálculo de SHA-256 está verificado en las trazas del autor (0 errores), pero no se documentan pruebas fuera de esos casos ni con entradas arbitrarias de gran longitud.
- La plantilla de chat declara funciones de nodo qwencoin por defecto cuando el llamador no pasa `tools`; para comportamiento stock de Qwen3.5 hay que pasar `tools=[]`. Esto puede sorprender en integraciones existentes.
- Las funciones `wallet_send`, `graph_bond`, `graph_vouch` y `ord_inscribe` mueven fondos o bloquean stake real en la cadena qwencoin; requieren revisión humana y controles de seguridad antes de uso en producción.
- Idiomas soportados no disponibles; no se garantiza un comportamiento multilingüe más allá del heredado del modelo base.
- Licencia apache-2.0: permite uso comercial, pero el ecosistema qwencoin y sus implicaciones financieras deben evaluarse por separado.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/staccs/Qwen3.5-0.8B-qwencoin
- Proyecto, nodo y cadena: https://huggingface.co/staccs/qwencoin
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
