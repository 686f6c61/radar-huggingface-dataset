# trymirai/Qwen3.5-4B-S

## Resumen

Qwen3.5-4B-S es una cuantización de alta calidad del modelo base Qwen/Qwen3.5-4B, publicada por trymirai (Mirai Labs) bajo el identificador trymirai/Qwen3.5-4B-S. El objetivo declarado por el autor es ofrecer una versión compacta del modelo original para inferencia local eficiente en Apple silicon, reduciendo el peso de los pesos a aproximadamente 2,5 bits por parámetro mediante una técnica de cuantización con trellis coding de estilo QTIP.

El checkpoint empaqueta 1.302.956.569 parámetros reales (frente a los aproximadamente 4B del modelo base), con un repositorio de 5,3 GB en formato safetensors y licencia Apache 2.0. La model card reporta una divergencia KL de 0,1221462 y una tasa de acuerdo top-1 del 86,81 % frente al profesor (el modelo base sin cuantizar), medidas con la herramienta romakl sobre 20 conversaciones y 16.980 tokens de continuación generados por el profesor.

La relevancia actual del modelo reside en su enfoque: no se trata de una cuantización de enteros convencional (GGUF/AWQ/GPTQ), sino de una cuantización con destilación consciente de cuantización de las escalas, orientada a un runtime propio (uzu) y optimizada para hardware Apple. Esto lo hace interesante para desarrolladores que quieran ejecutar un modelo de la familia Qwen3.5 en un Mac sin depender de GPUs dedicadas, aunque con la limitación de que el ecosistema de despliegue es todavía muy restringido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada del modelo base Qwen/Qwen3.5-4B; detalles no disponibles en la informacion proporcionada) |
| Parametros totales | 1.302.956.569 (checkpoint cuantizado); modelo base: aproximadamente 4B |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Cuantizacion con trellis coding estilo QTIP, aproximadamente 2,5 bits por peso; bits por matriz elegidos mediante ablaciones de KL; tags del repo mencionan 2-bit y 8-bit |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria uzu) |

## Arquitectura y entrenamiento

El checkpoint es una cuantizacion post-entrenamiento del modelo Qwen/Qwen3.5-4B. Segun la model card, se emplea cuantizacion con trellis coding de estilo QTIP a aproximadamente 2,5 bits por peso, con el numero de bits de cada matriz seleccionado a partir de ablaciones de KL medidas. Para reducir los valores atipicos de los pesos se aplican rotaciones aleatorias con estructura de Kronecker, y el redondeo se pondera mediante un sketch de Fisher de la distribucion de salida del propio modelo. El proceso incluye cuantizacion post-entrenamiento seguida de destilacion consciente de cuantizacion de las escalas.

No se dispone de informacion sobre la arquitectura interna del modelo base (tipo de atencion, si incorpora capas MoE, atencion lineal u otras innovaciones), ni sobre el volumen o composicion de los datos de entrenamiento originales, ni sobre si hubo RLHF o DPO. La model card remite explicitamente a la model card del modelo original para esos detalles. La evaluacion de calidad de la cuantizacion se realizo con romakl sobre su conjunto por defecto: 20 conversaciones y 16.980 tokens de continuacion generados por el profesor, con un resultado de KL 0,1221462 y acuerdo top-1 del 86,81 %. Los pesos de vision, MTP y speculator quedan excluidos del computo de tamano.

## Capacidades

- Generacion de texto: el pipeline declarado es text-generation.
- Capacidades heredadas del modelo base Qwen3.5-4B: la model card no detalla capacidades especificas; se remite a la model card original para arquitectura, uso previsto, evaluaciones y limitaciones.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible (el campo de idiomas no esta relleno en el repositorio).
- Capacidades especiales (vision, audio, thinking mode): no disponible. La model card menciona que existen pesos de vision, MTP y speculator en el modelo base, pero indica que quedan excluidos del computo de tamano del checkpoint; no se confirma que esten incluidos en esta cuantizacion.

## Casos de uso

- Inferencia local en Apple silicon: el caso de uso principal y explicito del autor. Se instala el paquete `mirai` via Homebrew y se ejecuta `mirai --model trymirai/Qwen3.5-4B-S`; el checkpoint esta disenado para aprovechar el hardware unificado de los Mac.
- Prototipado y experimentacion en un portatil: con 1,3B parametros efectivos y 5,3 GB de repositorio, permite probar flujos de generacion de texto sin GPU dedicada ni servidor.
- Evaluacion de tecnicas de cuantizacion: util para investigadores que quieran estudiar el compromiso calidad-tamano de la cuantizacion QTIP frente a alternativas como GGUF Q4 o AWQ, usando las metricas KL y acuerdo top-1 reportadas como referencia.
- Generacion de texto offline en entornos con conectividad limitada: al ejecutarse localmente, no requiere llamadas a API externas, lo que encaja en escenarios de privacidad o de trabajo de campo.
- Integracion en herramientas de desarrollo para macOS: al distribuirse como CLI, puede incorporarse a scripts y flujos de trabajo de linea de comandos en un Mac.
- Base para experimentos de destilacion y ajuste fino: el checkpoint cuantizado puede servir como punto de partida para estudiar la recuperacion de calidad tras cuantizacion o para comparar con el modelo base sin cuantizar.

## Benchmarks y rendimiento

La unica evaluacion publicada en la informacion disponible es la de calidad de cuantizacion con romakl:

| Metrica | Valor |
|---|---|
| Divergencia KL frente al profesor | 0,1221462 |
| Acuerdo top-1 con el profesor | 86,81 % |
| Conjunto de evaluacion | 20 conversaciones, 16.980 tokens de continuacion generados por el profesor |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. El repositorio ocupa 5,3 GB y el checkpoint tiene 1,3B parametros a aproximadamente 2,5 bits por peso, por lo que la huella de pesos es del orden de unos pocos GB; el consumo real de memoria durante la inferencia no esta documentado.
- GPU recomendadas: no disponible. El unico backend soportado segun la model card es Apple silicon; no se mencionan GPUs NVIDIA o AMD.
- Compatibilidad con GPU de consumo: no confirmada. El soporte declarado es exclusivamente para Apple silicon (Mac con chip de la serie M).
- Opciones de despliegue: runtime `uzu` (libreria del repositorio), CLI `mirai` instalable via Homebrew, y el runtime Prism (fork de llama.cpp de PrismML-Eng) usado para evaluar los empaquetados Bonsai 2. No se indica soporte para vLLM, llama.cpp estandar, Ollama o TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Despliegue |
|---|---|---|---|---|---|
| trymirai/Qwen3.5-4B-S | 1,3B (checkpoint); base ~4B | no disponible | ~2,5 bits/peso, QTIP | Apache 2.0 | uzu, CLI mirai (Apple silicon) |
| Qwen/Qwen3.5-4B (base) | ~4B | no disponible | sin cuantizar | Apache 2.0 | ecosistema estandar (no detallado) |
| Cuantizaciones GGUF convencionales de modelos de ~4B | ~4B (segun nivel Q) | depende del base | Q4_K_M, Q5_K_M, etc. | segun base | llama.cpp, Ollama, LM Studio |
| Cuantizaciones AWQ/GPTQ de modelos de ~4B | ~4B | depende del base | 4 bits | segun base | vLLM, TGI, AutoAWQ |

La comparacion cuantitativa de rendimiento con alternativas no esta disponible en la informacion proporcionada. La ventaja diferencial del checkpoint de Mirai es el tamano reducido y la orientacion a Apple silicon; su desventaja es el ecosistema de despliegue limitado frente a GGUF o AWQ.

## Limitaciones y advertencias

- Perdida de calidad por cuantizacion: el acuerdo top-1 con el modelo base es del 86,81 %, lo que implica que en torno al 13 % de las predicciones difieren del profesor; la divergencia KL de 0,122 confirma una desviacion no trivial.
- Soporte de plataforma restringido: la model card indica que actualmente solo se soporta inferencia en Apple silicon; no hay soporte documentado para GPUs NVIDIA, AMD ni para servidores Linux convencionales.
- Ecosistema inmaduro: depende de la libreria `uzu` y del CLI `mirai`, herramientas propias del autor con baja adopcion (42 descargas y 0 likes en el momento de la consulta), lo que implica menor soporte comunitario y mayor riesgo de cambios incompatibles.
- Idiomas no declarados: el campo de idiomas del repositorio no esta relleno, por lo que no se puede garantizar el rendimiento multilingue sin evaluacion propia.
- Capacidades no confirmadas: no hay informacion sobre tool calling, agentes, vision o modo thinking en este checkpoint; la presencia de pesos de vision en el modelo base no implica que esten operativos aqui.
- Sesgos y alucinaciones: no se documentan sesgos conocidos ni tasas de alucinacion en la informacion proporcionada; al derivar de un modelo base no evaluado en esta ficha, deben asumirse los riesgos habituales de los modelos de lenguaje.
- Licencia: Apache 2.0 permite uso comercial, pero la model card enlaza a la licencia del modelo base; conviene verificar que no existan restricciones adicionales en el modelo original.
- Contexto no documentado: se desconoce la longitud de contexto soportada, lo que impide planificar casos de uso con ventanas largas sin verificacion previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/trymirai/Qwen3.5-4B-S
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Model card del modelo base: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/README.md
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
- Blog de cuantizacion de Mirai Labs: https://trymirai.com/blog/quantization
- Repositorio uzu (instrucciones de ejecucion): https://github.com/trymirai/uzu/blob/how-to/docs/how-to-run-uzu.md
- Herramienta romakl: https://github.com/trymirai/romakl/tree/bfb79f548a80b6af7d9f4d4e35d0db99b97708e8
- Runtime Prism (fork de llama.cpp): https://github.com/PrismML-Eng/llama.cpp/tree/3f035ba664f8f08c3d9432b6421f8f1a0da1f37a
