# staccs/Qwen3.5-0.8B-qwencoin

## Resumen

Qwen3.5-0.8B-qwencoin es un checkpoint derivado de Qwen/Qwen3.5-0.8B publicado por el usuario staccs. No se trata de un modelo entrenado, sino de una fusión de pesos (merge) en la que se ha integrado una máquina de cálculo de SHA-256 directamente en la arquitectura: cinco capas de circuito se anteponen a las capas del transformer original de Qwen. El resultado es un `Qwen3_5ForCausalLM` estándar, sin código personalizado ni `trust_remote_code`, que puede calcular digests SHA-256 dentro de la misma llamada a `generate()`.

El modelo forma parte del proyecto qwencoin, una cadena derivada de Bitcoin en la que la función de hash y la prueba de trabajo se apoyan en los pesos de un modelo de lenguaje. El checkpoint declara en su plantilla de chat las funciones de un nodo de la cadena, de modo que el modelo puede emitir llamadas a herramientas (`<tool_call>`) para `sha256`, recibir la respuesta del circuito (`<tool_response>`) y continuar la conversación.

Su relevancia es fundamentalmente experimental: demuestra que es posible compilar cómputo criptográfico determinista dentro de los pesos de un transformer pequeño (2,18 mil millones de parámetros) manteniendo la compatibilidad con la librería `transformers`. Está publicado bajo licencia Apache 2.0 y el repositorio ocupa 4,4 GB.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer `Qwen3_5ForCausalLM` con 5 capas de circuito SHA-256 antepuestas; dimensión oculta ampliada de 1024 a 2240 |
| Parámetros totales | 2.175.833.760 (2,18 B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el autor verifica en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `transformers`) |

## Arquitectura y entrenamiento

El modelo es una fusión de pesos, no un entrenamiento. Sobre el transformer original de Qwen3.5-0.8B se han insertado cinco capas de circuito que implementan SHA-256, y la dimensión oculta se ha ampliado de 1024 a 2240 para acomodar el cómputo del hash. El modelo conserva la clase estándar `Qwen3_5ForCausalLM`, por lo que se carga con `AutoModelForCausalLM` sin necesidad de código remoto. Los tokens generados a partir del ID 248320 pertenecen a la máquina de hash; el resto corresponden al vocabulario normal del modelo base.

El flujo de inferencia es determinista con decodificación greedy: el modelo emite `<tool_call>` para `sha256`, el circuito consume 457 tokens (un bloque completo), imprime `<tool_response>` con el digest y el modelo de lenguaje continúa. El autor advierte que el circuito requiere kernels que calculen el hash de forma exacta; en kernels con redondeo distinto el digest puede ser incorrecto, por lo que recomienda comparar con `hashlib`. No se documenta número de tokens de entrenamiento, composición del dataset ni uso de RLHF/DPO, ya que no hubo entrenamiento.

## Capacidades

- Generación de texto conversacional heredada del modelo base Qwen3.5-0.8B.
- Cálculo nativo de SHA-256 dentro del flujo de tokens, computado por los pesos y no por código externo.
- Soporte de tool calling mediante la plantilla de chat, con emisión de `<tool_call>` y consumo de `<tool_response>`.
- Declaración de las funciones de un nodo qwencoin en la plantilla de chat (consulta de estado, movimiento de monedas, auditoría, dibujo de imágenes).
- Conversación multi-turno con reglas de parada estándar de `transformers`.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking, visión o audio: no disponibles.

## Casos de uso

- Verificación de integridad criptográfica en pipelines: el modelo puede calcular SHA-256 de una secuencia de bytes dentro de la propia llamada a `generate()`, útil para prototipos donde se quiera unificar generación de texto y cómputo de hash en un solo proceso.
- Nodo de la cadena qwencoin: el checkpoint se integra como modelo de un nodo mediante `bash tools/pipeline.sh join`, participando en la conversación entre nodos de la red y firmando sus respuestas.
- Experimentación con cómputo compilado en pesos: sirve como referencia para investigar cómo incrustar algoritmos deterministas en transformers sin código personalizado.
- Docencia y divulgación: ejemplo práctico de fusión de pesos y de ampliación de dimensión oculta para acomodar circuitos.
- Pruebas de tool calling determinista: con decodificación greedy y reglas de parada estándar, permite validar flujos de llamada a herramienta con respuesta estructurada.
- Auditoría de kernels: el script `tools/probe_backend.py` del proyecto permite medir qué kernels de una máquina calculan el hash de forma exacta, lo que convierte al modelo en banco de pruebas de backends.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor únicamente documenta la verificación del digest SHA-256 contra `hashlib` en bfloat16 sobre CPU x86-64, y señala que los modelos pequeños pueden miscopiar dígitos hexadecimales al transcribir el digest en la frase posterior.

## Requisitos de hardware

- Memoria estimada: unos 9 GB de RAM para el checkpoint de 0,8 B en el contexto del nodo; el repositorio ocupa 4,4 GB en disco.
- El nodo requiere aproximadamente 8 GB de disco y funciona sin GPU.
- Verificado en bfloat16 sobre CPU x86-64; no se documentan requisitos de VRAM para GPU.
- GPU recomendadas: no disponibles en la información proporcionada.
- Despliegue: `transformers` con `AutoModelForCausalLM` y `dtype=torch.bfloat16`; el nodo se instala con un script (`install.sh`) en Linux x86-64 y en Windows mediante WSL2. macOS no tiene nodo disponible, aunque el checkpoint carga con las líneas de Python indicadas.
- Existe una variante fusionada de 2 B (7,4 GB) que se puede obtener con `bash tools/pipeline.sh minds 2B` si la máquina tiene memoria suficiente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-0.8B-qwencoin | 2,18 B | no disponible | Transformer con circuito SHA-256 fusionado | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-0.8B (base) | no disponible en la información | no disponible | Transformer estándar | no disponible en la información | Hugging Face |
| Variante fusionada 2 B de qwencoin | no disponible | no disponible | Igual con modelo mayor | Apache 2.0 | Hugging Face (vía `pipeline.sh minds 2B`) |

No se dispone de datos de rendimiento comparativo con otras alternativas en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo entrenado: sus capacidades de lenguaje son las del modelo base Qwen3.5-0.8B, y el circuito añadido solo aporta el cómputo de SHA-256.
- El digest puede ser incorrecto en kernels que redondeen de forma distinta; es imprescindible comparar con `hashlib` antes de usarlo en producción.
- El modelo pequeño puede miscopiar dígitos hexadecimales al transcribir el digest en la frase posterior a la respuesta de la herramienta.
- El nodo solo está disponible para Linux x86-64 (y Windows vía WSL2); macOS queda pendiente.
- El nodo requiere aproximadamente 9 GB de memoria para el modelo de 0,8 B; con menos memoria funciona sin modelo.
- Un nodo nuevo no tiene monedas y debe minar; las monedas de un bloque no son gastables hasta 100 bloques después.
- El límite de pago o aval por respuesta es de 1 moneda por defecto, ampliable con `MIND_LIMIT=inf` en `local.env`.
- La dirección del nodo público puede cambiar cuando se reemplaza el pod; el archivo `SEEDS` del repositorio contiene la dirección vigente.
- Sesgos conocidos y riesgo de alucinación: no documentados en la información proporcionada, aunque son heredables del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/staccs/Qwen3.5-0.8B-qwencoin
- Proyecto qwencoin: https://huggingface.co/staccs/qwencoin
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
