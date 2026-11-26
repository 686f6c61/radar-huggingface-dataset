# Tree-AI-lab/kouman-1.0-edge-1B

## Resumen

Kouman Edge 1B es un modelo de lenguaje de 1.235.814.400 parametros desarrollado por Tree AI Lab (Costa de Marfil) a partir de un ajuste continuado (continued pre-training, CPT) sobre la arquitectura Meta Llama 3.2 1B. Su proposito es cubrir dos lenguas africanas de Costa de Marfil, el baulé (`bci`) y el dioula (`dyu`), manteniendo competencia en frances e ingles, y hacerlo en un formato lo bastante pequeno como para ejecutarse en un telefono movil de forma totalmente offline.

El modelo se distribuye simultaneamente en `safetensors` bfloat16 para `transformers`, vLLM u Ollama, y en una gama completa de cuantizaciones GGUF para `llama.cpp` que va de `Q8_0` (1,23 GB) a `Q2_K` (554 MB). Las cuantizaciones de 3 a 6 bits estan calibradas con una `imatrix` construida sobre los cuatro idiomas, un detalle relevante porque las cuantizaciones de baja precision tienden a degradar de forma desproporcionada los idiomas de bajos recursos.

Su relevancia actual es doble: por un lado, demuestra que el CPT sobre una base de 1B puede reducir la perplejidad en idiomas africanos en un factor de 7 a 9 veces sin practicamente olvidar frances ni ingles; por otro, ofrece un artefacto desplegable en dispositivos de gama baja, un escenario donde la mayoria de la oferta open source sigue sin cubrir idiomas como el baulé o el dioula.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2 1B, ajuste continuado) |
| Parametros totales | 1.235.814.400 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (heredada de Llama 3.2 1B; el autor no la especifica) |
| Tipos de cuantizacion | GGUF: `Q8_0`, `Q6_K`, `Q5_K_M`, `Q5_K_S`, `Q4_K_M`, `Q4_K_S`, `Q4_0`, `Q3_K_M`, `Q3_K_S`, `Q2_K`; pesos completos en bfloat16 |
| Idiomas soportados | baulé (`bci`), dioula (`dyu`), frances (`fr`), ingles (`en`) |
| Licencia | Llama 3.2 Community License |
| Formato de pesos | `safetensors` (BF16), GGUF, ONNX |

## Arquitectura y entrenamiento

La base es la arquitectura Llama 3.2 1B, un transformer decoder-only denso con atencion causal estandar (no se anuncia ninguna variante de atencion lineal ni hibrida). Sobre esa base, Tree AI Lab aplico un continued pre-training de aproximadamente 1.700 millones de tokens en 6.488 pasos con un scheduler de learning rate WSD (warmup-stable-decay). No se detalla en la informacion disponible la composicion exacta del corpus ni si hubo fases posteriores de SFT, RLHF o DPO, aunque la model card describe el checkpoint como "Instruct" y el ejemplo de uso emplea `apply_chat_template`, lo que sugiere un formato conversacional.

La innovacion tecnica mas concreta es la calibracion de las cuantizaciones GGUF con una `imatrix` construida sobre los cuatro idiomas. Esto es especialmente relevante en un modelo de 1B: a esa escala, las cuantizaciones de 3 y 4 bits degradan mucho mas la calidad que en modelos grandes, y el sesgo de calibracion hacia el ingles suele penalizar precisamente a los idiomas de bajos recursos. El autor reporta que la matriz se construyo especificamente para preservar baulé y dioula en movil.

## Capacidades

- Generacion de texto conversacional multi-turno en baulé, dioula, frances e ingles.
- Traduccion entre los cuatro idiomas, con especial enfasis en el par frances/baulé y frances/dioula.
- Razonamiento basico y respuesta a instrucciones, heredados del ajuste de Llama 3.2 1B.
- Generacion de codigo limitada, propia de un modelo de 1B; no es su caso de uso principal.
- Ejecucion totalmente offline en dispositivo (on-device), sin llamadas a API.
- Compatibilidad con `llama.cpp`, `transformers`, vLLM y Ollama.
- Soporte de plantilla de chat mediante `apply_chat_template`.
- No se documenta soporte de tool calling, function calling, agentes, vision ni audio.

## Casos de uso

- Asistente conversacional offline en zonas rurales de Costa de Marfil: el modelo cabe en `Q4_K_M` (770 MB) y se ejecuta en un Android de gama media sin conexion, lo que permite atender consultas en baulé o dioula donde no hay cobertura de red.
- Traduccion frances/baulé y frances/dioula en aplicaciones de mensajeria: la reduccion de perplejidad de 20,74 a 2,90 en `bci` y de 19,58 a 2,25 en `dyu` lo hace viable para traduccion asistida de frases cortas, con revision humana en textos sensibles.
- Digitalizacion de atencion primaria: un asistente que traduzca indicaciones medicas del frances al baulé en una tableta sin conectividad, aprovechando que el modelo no requiere red ni GPU dedicada.
- Educacion bilingue: generacion de ejercicios y explicaciones en lengua local para escuelas que trabajan con curriculo en frances pero alumnado baulé-hablante.
- Integracion en apps moviles mediante `llama.cpp` y la API compatible con PocketPal AI o ChatterUI, usando el GGUF `Q4_K_M` o `Q3_K_M` como artefacto de distribucion.
- Prototipado rapido en servidor con `transformers` en BF16 o vLLM para evaluar calidad antes de decidir la cuantizacion a empaquetar en el cliente.
- Servicio de mensajeria SMS/USSD con un backend ligero: al ser un modelo de 1,2B, el coste por token en CPU es bajo y permite desplegar en un solo nodo sin GPU.

## Benchmarks y rendimiento

El autor solo publica perplejidad (PPL) del CPT frente a la base Llama 3.2 1B. No hay datos de MMLU, HumanEval, GSM8K ni evaluaciones estandarizadas en la informacion disponible.

| Idioma | Llama 3.2 1B (PPL) | Kouman Edge 1B (PPL) | Ganancia |
|---|---:|---:|---:|
| Baulé (`bci`) | 20,74 | 2,90 | -17,84 (÷7,2) |
| Dioula (`dyu`) | 19,58 | 2,25 | -17,33 (÷8,7) |
| Frances (`fr`) | 9,33 | 4,40 | -4,93 (sin olvido declarado) |
| Ingles (`en`) | 6,77 | 5,12 | -1,65 (sin olvido declarado) |

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para BF16: aproximadamente 2,5 GB de pesos mas overhead de activaciones y KV cache; cabe en cualquier GPU consumer con 6 GB o mas.
- VRAM estimada en GGUF: de 554 MB (`Q2_K`) a 1,23 GB (`Q8_0`) de pesos; el consumo real anade el contexto y el runtime de `llama.cpp`.
- GPU recomendadas: no requiere GPU. Para servidor, cualquier A100, H100, L40S o RTX 4090 esta sobredimensionada; una RTX 3060 o incluso CPU moderna es suficiente.
- Cabe en GPU consumer: si, en practicamente todas (GTX 1650 4 GB en adelante con `Q4_K_M`).
- Movil: `Q4_K_M` (770 MB) es la opcion recomendada para Android/iOS; `Q3_K_M` (659 MB) para dispositivos de 4 GB de RAM; `Q2_K` (554 MB) solo como experimento.
- Opciones de despliegue: `llama.cpp` (`llama-cli`, `llama-server`), Ollama, vLLM, `transformers`, TGI y apps moviles basadas en `llama.cpp` (PocketPal AI, ChatterUI).
- Latencia y throughput: no disponibles en la informacion proporcionada. Al ser un modelo de 1,2B en CPU ARM con cuantizacion de 4 bits, es razonable esperar decodificacion interactiva en moviles modernos, pero el autor no publica cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---:|---|---|---|---|
| Kouman Edge 1B | 1,24B | no disponible | bci, dyu, fr, en | Llama 3.2 | safetensors, GGUF, ONNX |
| Meta Llama 3.2 1B | 1,24B | 128K (segun ficha de Meta) | multilingue, sin bci/dyu | Llama 3.2 | safetensors, GGUF |
| Qwen2.5 1.5B Instruct | 1,54B | 32K (segun ficha de Qwen) | multilingue, sin bci/dyu | Apache 2.0 | safetensors, GGUF |
| Gemma 2 2B | 2,6B | 8K (segun ficha de Google) | multilingue, sin bci/dyu | Gemma Terms | safetensors, GGUF |

La diferencia sustantiva frente a las alternativas no es el rendimiento general, sino la cobertura de baulé y dioula con perplejidades de 2,90 y 2,25, y la existencia de cuantizaciones calibradas con `imatrix` multilingue para despliegue movil. En tareas generales en ingles, un Qwen2.5 1.5B o un Gemma 2 2B probablemente rinden mejor, pero ninguno cubre las lenguas objetivo.

## Limitaciones y advertencias

- Modelo de 1,2B: capacidad de razonamiento, matematicas y codigo limitada; no debe usarse como sustituto de modelos de 7B o superiores en tareas complejas.
- Riesgo de alucinacion alto en un modelo de este tamano, especialmente en consultas factuales o medicas; requiere supervision humana en dominios sensibles.
- La licencia Llama 3.2 Community License impone restricciones de uso comercial (umbral de 700 millones de usuarios mensuales), obligaciones de atribucion y nomenclatura; hay que revisarla antes de un despliegue en produccion.
- La longitud de contexto no se especifica en la model card; aunque herede la de Llama 3.2 1B, conviene verificarla empiricamente antes de disenar prompts largos.
- El CPT se ha realizado sobre aproximadamente 1,7B tokens; la cobertura lexica de baulé y dioula, aunque mejorada, sigue siendo acotada y puede fallar en terminologia tecnica o dominios especializados.
- Las cuantizaciones `Q3_K_S` y `Q2_K` presentan degradacion esperada; el propio autor desaconseja `Q2_K` para uso real.
- No se documentan evaluaciones de sesgo, toxicidad ni seguridad; en un contexto multilingue africano esto es un riesgo a cubrir con filtros propios.
- El repositorio ocupa 30,2 GB por incluir todos los formatos; conviene descargar solo el artefacto necesario.

## Enlaces

- Hugging Face: https://huggingface.co/Tree-AI-lab/kouman-1.0-edge-1B
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-1B
- `llama.cpp`: https://github.com/ggerganov/llama.cpp
- PocketPal AI: https://github.com/a-ghorbani/pocketpal-ai
- ChatterUI: https://github.com/Vali-98/ChatterUI
- Licencia Llama 3.2: https://www.llama.com/llama3_2/license/
