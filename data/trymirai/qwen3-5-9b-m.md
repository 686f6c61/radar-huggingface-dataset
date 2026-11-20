# trymirai/Qwen3.5-9B-M

## Resumen

Mirai's Qwen3.5-9B Medium Quantization es una cuantización mixta INT4/INT8 del modelo Qwen/Qwen3.5-9B, desarrollada por Mirai Labs (publicada bajo la cuenta trymirai). Su objetivo es reducir el peso del modelo para permitir inferencia local en Apple silicon manteniendo una calidad cercana al modelo original: segun la model card, el checkpoint alcanza una divergencia KL de 0,0069104 y un 97,40 % de acuerdo top-1 frente al profesor en el conjunto de evaluacion romakl (20 conversaciones y 14.399 tokens de continuacion generados por el profesor).

El paquete no es solo una cuantización: incluye un especulador de decodificacion (un modelo borrador DFlash de seis capas, un modelo Weaver de una capa para la construccion del arbol y una cabeza de confianza aprendida) que acelera la generacion mediante decodificacion especulativa. La cuantizacion se entreno con 12.500 pasos de quantization-aware training (QAT).

El modelo base es Qwen3.5-9B de Alibaba, pero el checkpoint publicado declara 4.940.608.000 parametros reales en safetensors (el sufijo "9B" del nombre no coincide con el recuento del repositorio). La libreria de inferencia es `uzu`, propia de Mirai, y actualmente solo se soporta inferencia en Apple silicon. La licencia es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5-9B) cuantizado; incluye especulador DFlash + Weaver para decodificacion especulativa |
| Parametros totales | 4.940.608.000 (safetensors); el modelo base se denomina Qwen3.5-9B |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT4 asimetrica (zero points de 4 bits, escalas bfloat16, group size 32, Hadamard-32) en proyecciones; INT8 en filas key/value de atencion; vocabulario mixto (2.496 filas INT8 + 245.824 filas INT4 por tabla); especulador en 2-bit MLX (group size 128, Hadamard-32) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria `uzu`) |

## Arquitectura y entrenamiento

El checkpoint parte de la arquitectura transformer de Qwen3.5-9B y aplica una cuantizacion mixta: las proyecciones del transformer usan cuantizacion asimetrica de 4 bits con zero points de 4 bits, escalas bfloat16, tamano de grupo 32 y transformadas Hadamard-32. Las filas key/value de la atencion se mantienen en INT8, y las tablas de vocabulario de entrada y salida combinan 2.496 filas INT8 con 245.824 filas INT4; tanto las tablas como el tokenizer se reordenan de forma consistente para mantener esas filas contiguas y alineadas a bloques de 32.

El proceso de cuantizacion incluye 12.500 pasos de quantization-aware training. Ademas, el directorio `speculator/` incorpora un modelo borrador DFlash de seis capas, un modelo Weaver de una capa para construir el arbol de decodificacion especulativa y una cabeza de confianza aprendida; las proyecciones del especulador usan cuantizacion MLX de 2 bits con group size 128 y transformadas Hadamard-32. Este checkpoint Medium comparte los pesos del especulador y de la cabeza de confianza con la variante Large, y su numeracion de vocabulario preserva el token de mascara del modelo borrador.

## Capacidades

- Generacion de texto: el pipeline declarado es `text-generation`; hereda las capacidades del modelo base Qwen3.5-9B.
- Decodificacion especulativa integrada: el especulador DFlash + Weaver + cabeza de confianza permite acelerar la generacion respecto a la decodificacion autoregresiva estandar.
- Calidad preservada: 97,40 % de acuerdo top-1 con el profesor y KL de 0,0069104 en el conjunto romakl.
- Capacidades del modelo base (razonamiento, codigo, matematicas, tool calling, multilingue): no detalladas en la informacion proporcionada; deben consultarse en la model card de Qwen/Qwen3.5-9B.
- Vision y MTP: la model card menciona que los pesos de vision, MTP y especulador se excluyen del calculo de tamano, lo que sugiere que el modelo base incorpora componentes de vision y MTP, aunque no se detalla su funcionamiento en este checkpoint.

## Casos de uso

- Inferencia local en Mac con Apple silicon: el caso de uso principal; mediante `brew install mirai` y `mirai --model trymirai/Qwen3.5-9B-M` se puede ejecutar el modelo en local sin GPU dedicada, aprovechando la cuantizacion mixta y el especulador.
- Asistentes de codigo en el portatil: al derivar de Qwen3.5-9B y caber en el espacio de un equipo de sobremesa Apple, permite autocompletado y generacion de codigo sin enviar datos a la nube.
- Prototipado de agentes con decodificacion rapida: la cabeza de confianza y el especulador reducen la latencia en generaciones largas, lo que resulta util en bucles de razonamiento multi-paso.
- Evaluacion de tecnicas de cuantizacion: el checkpoint publica metricas KL y acuerdo top-1, por lo que sirve como referencia reproducible para comparar metodos de QAT y cuantizacion mixta.
- Despliegue en entornos con requisitos de privacidad: al ser local y Apache 2.0, se puede usar en escenarios donde no esta permitido el envio de datos a APIs externas.
- Investigacion sobre decodificacion especulativa: el directorio `speculator/` con DFlash, Weaver y la cabeza de confianza es un artefacto util para estudiar y reutilizar decodificacion especulativa con modelos borrador cuantizados a 2 bits.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Divergencia KL (romakl, 20 conversaciones, 14.399 tokens) | 0,0069104 |
| Acuerdo top-1 con el profesor | 97,40 % |

No se han publicado en la informacion disponible resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) para este checkpoint. Las cifras anteriores corresponden a la evaluacion de fidelidad de la cuantizacion, no a capacidad de tarea.

## Requisitos de hardware

- Plataforma soportada: exclusivamente Apple silicon (macOS); no se soporta CUDA ni otras plataformas segun la model card.
- VRAM/memoria unificada estimada: no disponible de forma explicita; el repositorio ocupa 34,6 GB, por lo que se requiere memoria unificada suficiente para cargar los pesos cuantizados y el especulador.
- GPU recomendadas: no aplica; el soporte es para chips Apple (M-series). No se indican modelos concretos.
- Cabida en GPU consumer: no disponible; el modelo no esta pensado para GPUs NVIDIA consumer en esta distribucion.
- Opciones de despliegue: CLI `mirai` (Homebrew) y la libreria `uzu`; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; la model card solo afirma que el especulador mejora la frontera velocidad-calidad, sin cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Plataforma |
|---|---|---|---|---|---|
| trymirai/Qwen3.5-9B-M | 4.940.608.000 (safetensors) | no disponible | INT4/INT8 mixta + especulador 2-bit | Apache 2.0 | Apple silicon (`uzu`) |
| Qwen/Qwen3.5-9B (base) | denominado 9B | no disponible | bfloat16 (original) | Apache 2.0 | multiple |
| Variante Large de Mirai | no disponible | no disponible | mixta (comparte especulador) | Apache 2.0 | Apple silicon (`uzu`) |

No se dispone de datos de benchmarks comparativos con otras cuantizaciones (por ejemplo, MLX o GGUF del mismo modelo base) en la informacion proporcionada.

## Limitaciones y advertencias

- Plataforma restringida: solo Apple silicon; no hay soporte para CUDA, ROCm ni CPU generica en la libreria `uzu`.
- Ecosistema cerrado: requiere la CLI `mirai` o la libreria `uzu`; no es compatible directamente con vLLM, llama.cpp, Ollama o TGI.
- Idiomas soportados no declarados: la ficha de Hugging Face indica "no disponibles"; el comportamiento multilingue depende del modelo base y no esta verificado en este checkpoint.
- Longitud de contexto no declarada: no se especifica en la informacion disponible.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; la cuantizacion introduce una divergencia adicional (KL 0,0069104, 97,40 % de acuerdo top-1), por lo que puede haber degradaciones puntuales respecto al modelo original.
- Sesgos: no documentados en la informacion disponible; deben consultarse en la model card de Qwen3.5-9B.
- Uso comercial: permitido por Apache 2.0, pero conviene revisar la licencia del modelo base y las condiciones de la libreria `uzu`.
- Discrepancia de parametros: el nombre indica 9B pero el recuento real en safetensors es de 4.940.608.000; conviene verificar el tamano efectivo antes de planificar el despliegue.
- Componentes no incluidos en el calculo de tamano: vision, MTP y especulador se excluyen del tamano reportado, lo que puede afectar a la estimacion de memoria real necesaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/trymirai/Qwen3.5-9B-M
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-9B/blob/main/LICENSE
- Model card del modelo base: https://huggingface.co/Qwen/Qwen3.5-9B/blob/main/README.md
- Repositorio `uzu`: https://github.com/trymirai/uzu/blob/main/README.md
- Herramienta `romakl`: https://github.com/trymirai/romakl/tree/bfb79f548a80b6af7d9f4d4e35d0db99b97708e8
- Blog de cuantizacion de Mirai: https://trymirai.com/blog/quantization
- Pagina del modelo en Mirai: https://trymirai.com/local-models/alibaba-qwen3-5-9b-mirai-mirai-m-4
