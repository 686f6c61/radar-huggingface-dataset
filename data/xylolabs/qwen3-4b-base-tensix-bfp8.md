# Xylolabs/Qwen3-4B-Base-Tensix-BFP8

## Resumen

Qwen3-4B-Base-Tensix-BFP8 es una versión cuantizada del modelo base Qwen3-4B-Base, publicada por Xylolabs y orientada específicamente a la ejecución sobre aceleradores Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole). La cuantización se aplica únicamente a las capas lineales de atención y MLP mediante GPTQ sobre la rejilla de coma flotante por bloques nativa del hardware, `ttnn.bfloat8_b` (BFP8), de modo que los pesos ya se encuentran en el formato que TT-NN empaqueta sin transformación adicional.

El modelo conserva la arquitectura transformer densa del Qwen3-4B-Base original, con 4.411.424.256 parámetros totales y 36 capas, pero reduce el peso medio a 9,23 bits por parámetro y el tamaño empaquetado a 4,639 GB, frente a los 8,04 GB del checkpoint BF16. El objetivo no es mejorar la calidad del modelo base, sino ofrecer un checkpoint que pueda cargarse de forma directa en el stack de software de Tenstorrent (tt-metal, TT-NN, tt-forge) con una degradación mínima respecto al original.

La relevancia actual reside en que es una de las pocas publicaciones que documenta de forma explícita el proceso de cuantización para una rejilla BFP propietaria, incluyendo scripts de verificación y métricas de fidelidad (KL y top-1) frente al modelo BF16 y frente a una cuantización Q4_K_M de llama.cpp. Es un modelo base, no ajustado por instrucciones, lo que limita su uso directo en aplicaciones conversacionales sin un post-entrenamiento adicional.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3), 36 capas |
| Parámetros totales | 4.411.424.256 |
| Parámetros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada de Qwen3-4B-Base) |
| Tipos de cuantización | BFP8 (`ttnn.bfloat8_b`) en capas lineales de atención (q, k, v, o) y MLP (gate, up, down); resto en BF16 |
| Idiomas soportados | no disponible en la información proporcionada (calibración en inglés y coreano) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16 con valores ya sobre la rejilla BFP8), más `quant4.json` e índice de shards |

## Arquitectura y entrenamiento

El checkpoint parte de Qwen/Qwen3-4B-Base, un transformer denso de 36 capas con atención multi-cabeza y MLP con activación SwiGLU, y no introduce cambios arquitectónicos: la modificación es exclusivamente de precisión numérica. Las proyecciones lineales de atención (q, k, v, o) y de MLP (gate, up, down) se cuantizan a BFP8 con GPTQ sobre la rejilla `bfloat8_b` de TT-NN, manteniendo el exponente compartido de cada bloque tal y como lo fija el empaquetador del hardware. La LM head (atada al embedding), el embedding, las normas y el resto de tensores permanecen en BF16, igual que en el modelo base. El resultado es un peso medio de 9,23 bits por parámetro y 4,639 GB empaquetados.

La calibración de GPTQ se realizó sobre 65.536 tokens de WikiText-2 y de Wikipedia en coreano. El repositorio incluye `quant4.json`, que documenta el formato de cada proyección, así como los scripts `pack_tensix.py` (verifica que cada matriz empaquetada en TT-NN no altera ningún valor) y `verify_grid.py` (comprueba la rejilla solo con PyTorch). El autor indica que las pruebas se hicieron con ttnn 0.81.1 sobre ttsim, el simulador de Blackhole de Tenstorrent, y no sobre hardware físico; tt-transformers y tt-forge no se ejecutaron con este checkpoint.

## Capacidades

- Generación de texto autoregresiva y continuación de texto: es un modelo base, no ajustado por instrucciones.
- Razonamiento y conocimiento general heredados de Qwen3-4B-Base.
- Capacidad de código y matemáticas heredada del modelo base (sin métricas específicas publicadas para este checkpoint).
- Soporte multilingüe heredado de Qwen3-4B-Base; la información disponible solo documenta calibración en inglés y coreano.
- No incluye tool calling ni function calling de forma nativa, al no estar ajustado por instrucciones.
- No incluye modo thinking explícito ni capacidades de visión o audio.
- El tokenizador conserva la plantilla de chat del modelo base, pero el modelo no está entrenado para seguir instrucciones.

## Casos de uso

- Despliegue en aceleradores Tenstorrent Wormhole y Blackhole: el checkpoint está pensado para cargarse directamente en TT-NN, que empaqueta los tensores BFP8 sin conversión, reduciendo el coste de carga y el uso de DRAM frente al BF16.
- Investigación sobre cuantización BFP: sirve como referencia reproducible para estudiar el impacto de la rejilla `bfloat8_b` en la fidelidad de un transformer, con métricas KL y top-1 publicadas frente a BF16 y Q4_K_M.
- Generación de texto en pipelines de completado: al ser un modelo base, encaja en tareas de continuación de texto, autocompletado y generación de documentos donde no se requiere seguimiento de instrucciones.
- Fine-tuning posterior sobre hardware Tenstorrent: al mantener la licencia Apache 2.0 y el tokenizador original, puede servir como punto de partida para ajustes supervisados o DPO antes de un despliegue específico.
- Evaluación comparativa de stacks de cuantización: permite contrastar la fidelidad de BFP8 con GPTQ frente a alternativas como Q4_K_M de llama.cpp sobre el mismo checkpoint base.
- Prototipado en simulador: el autor valida el empaquetado con ttsim (simulador de Blackhole), lo que permite desarrollar y depurar pipelines TT-NN sin disponer de hardware físico.
- Servicio de inferencia con TGI: el repositorio declara compatibilidad con text-generation-inference y endpoints, lo que facilita su integración en infraestructuras estándar de serving.

## Benchmarks y rendimiento

| Modelo | Bits por peso | Tamaño (GB) | KL media vs BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (Qwen/Qwen3-4B-Base) | 16 | 8,04 | 0 | 100 | 28 de 28 | - |
| **Este modelo (BFP8)** | 9,23 | 4,639 | 0,00126 | 98,34 | 28 de 28 | 0 |
| Q4_K_M (llama.cpp) | 4,96 | 2,497 | 0,04793 | 89,65 | 28 de 28 | 0 |

Las métricas KL y top-1 se calculan sobre 8.184 posiciones de texto en inglés y coreano (test de WikiText-2 y Wikipedia en coreano) en formato de texto plano. Las respuestas corresponden a 28 prompts cortos con verificación automática, en formato de completado y con 3 ejemplos. El autor advierte que estas cifras miden la cercanía al BF16, no la calidad en tareas, y que no se midió velocidad en dispositivo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4,64 GB para los pesos empaquetados en BFP8; el checkpoint en safetensors ocupa 8,8 GB en disco.
- GPU recomendadas: no aplica de forma nativa; el destino principal son aceleradores Tenstorrent Tensix (Wormhole, Blackhole). Para ejecución en GPU convencional puede cargarse como BF16 con transformers, requiriendo en torno a 9-10 GB de VRAM.
- Cabe en GPU de consumo: sí, en tarjetas con 12 GB o más de VRAM si se carga en BF16; el formato BFP8 solo es aprovechable en hardware Tensix.
- Opciones de despliegue: TT-NN (tt-metal), ttsim (simulador de Blackhole), transformers con `AutoModelForCausalLM`, y text-generation-inference según los tags del repositorio.
- Latencia y throughput: no disponibles; el autor indica explícitamente que no se midió velocidad en dispositivo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Xylolabs/Qwen3-4B-Base-Tensix-BFP8 | 4,41 B | no disponible | BFP8 (GPTQ) | Apache 2.0 | Hugging Face |
| Qwen/Qwen3-4B-Base | 4,41 B | no disponible | BF16 | Apache 2.0 | Hugging Face |
| Qwen3-4B-Base en Q4_K_M (llama.cpp) | 4,41 B | no disponible | Q4_K_M | Apache 2.0 | Generado localmente con llama.cpp |
| Qwen3-4B (ajustado por instrucciones) | 4,41 B | no disponible | BF16 y GGUF | Apache 2.0 | Hugging Face |

La comparación relevante es frente al modelo base en BF16 y frente a la cuantización Q4_K_M: BFP8 ofrece una fidelidad mucho mayor (KL 0,00126 frente a 0,04793) a costa de un tamaño casi el doble (4,639 GB frente a 2,497 GB), pero su ventaja práctica solo se materializa en hardware Tensix.

## Limitaciones y advertencias

- Es un modelo base, no ajustado por instrucciones: no sigue instrucciones ni mantiene diálogos de forma fiable sin un post-entrenamiento.
- No se han validado los pesos en hardware Tensix físico; las pruebas se realizaron sobre ttsim (simulador de Blackhole) con ttnn 0.81.1.
- tt-transformers y tt-forge no se ejecutaron con este checkpoint, por lo que su compatibilidad con esos stacks no está confirmada.
- La calibración de GPTQ se limita a inglés y coreano (WikiText-2 y Wikipedia en coreano), lo que puede sesgar la fidelidad en otros idiomas.
- Riesgo de alucinación inherente al modelo base Qwen3-4B-Base; no se han publicado evaluaciones de sesgo específicas para este checkpoint.
- El formato BFP8 solo es aprovechable en hardware Tensix; en GPU convencional se carga como BF16 y se pierde la ventaja de tamaño.
- No se han publicado mediciones de latencia ni throughput en dispositivo.
- Licencia Apache 2.0, que permite uso comercial; el autor declara no estar afiliado ni respaldado por Tenstorrent y distribuye el modelo "as is", sin garantía.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/Qwen3-4B-Base-Tensix-BFP8
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Base
- Repositorio de código tensix-bfp-gptq: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Paper Qwen3 Technical Report: https://arxiv.org/abs/2505.09388
- Licencia: https://huggingface.co/Xylolabs/Qwen3-4B-Base-Tensix-BFP8/blob/main/LICENSE
