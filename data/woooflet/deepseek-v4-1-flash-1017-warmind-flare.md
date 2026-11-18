# woooflet/DeepSeek-V4.1-Flash-1017-warmind-FLARE

## Resumen

DeepSeek-V4.1-Flash-1017-warmind-FLARE es un paquete de despliegue listo para servir del checkpoint WARMIND-1017 (v1.1 "orth4c") de jcartu, a su vez derivado de deepseek-ai/DeepSeek-V4.1-Flash-1017. Lo publica el usuario woooflet y lo firma Ford Morris, y su proposito no es entrenar un modelo nuevo sino empaquetar pesos ya existentes en formato Flare para un cluster de 4 nodos DGX Spark con GB10, de modo que pueda lanzarse con un unico comando sobre el runtime estandar de Flare sin parches.

La edicion WARMIND combina una abliteration biproyectada que preserva la norma con una ortogonalizacion de un subespacio epistemico de abstención de 4 dimensiones. Segun la model card, esa segunda mitad es la que produce un efecto medible: sobre una muestra identica de SQuAD-2.0, el paquete se abstiene en 0,750 de las preguntas no respondibles con prompt plano (0,812 con prompt de anclaje), frente a 0,438 y 0,521 del paquete hermano Uncensored, y la fabricacion cae de 0,562 a 0,250, mientras los benchmarks de capacidad estandar se mantienen dentro del ruido respecto al paquete stock (MMLU 0,8786 frente a 0,8814).

La relevancia es acotada pero concreta: es un artefacto de inferencia para hardware Blackwell de sobremesa (GB10), con contexto declarado de 1.048.576 tokens y un pool de KV de 36.375.936 tokens, pensado para quien ya opera un cluster DGX Spark y quiere servir una variante con bajas tasas de rechazo y mayor abstención ante preguntas sin respuesta. Los pesos son bit-identicos al release de jcartu; el repositorio solo cambia el empaquetado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de DeepSeek-V4.1-Flash; la model card menciona MLA, MTP/DSpark, torre de vision y tablas Engram) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 1.048.576 tokens (configuracion de exportacion) |
| Tipos de cuantizacion | NVFP4 en cabezas draft, FP8 en cabezas Markov, compresion de escala de expertos CSF, computo MLA en BF16 (segun export) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (empaquetado como paquete Flare) |

## Arquitectura y entrenamiento

No se dispone de la arquitectura completa en la informacion proporcionada. La model card indica que el modelo subyacente emplea MLA (Multi-head Latent Attention) con computo en BF16, un bloque MTP/DSpark con 5 tokens draft y verificacion adaptativa (alpha 0,75 en serving), tablas Engram, una torre de vision y un conjunto de expertos enrutados junto a expertos compartidos (se referencian tensores `ffn.shared_experts.w2`). El pipeline declarado es image-text-to-text, lo que confirma capacidades multimodales de entrada.

No hubo entrenamiento nuevo en este repositorio. La edicion WARMIND consiste en una eliminacion de direccion de rechazo biproyectada por capa con preservacion de norma, mas la ortogonalizacion de un subespacio de abstención epistemica de 4 dimensiones, con alpha compensado por capa `min(3.5, 3.0/(1−||U4ᵀr_L||²))`. Una auditoria tensor a tensor con SHA-256 contra el checkpoint stock de deepseek-ai confirma que solo cambiaron 132 tensores de 96.085, exactamente los declarados (`attn.wo_b` y `ffn.shared_experts.w2`, peso y escala, en capas 4 a 36), y que el resto es bit-identico, incluidos los expertos enrutados, las tablas Engram, el bloque MTP/DSpark, la torre de vision, embeddings, normas y la LM head.

## Capacidades

- Generacion de texto y razonamiento con modo thinking activable; los benchmarks reportados se midieron con thinking on.
- Procesamiento de imagen y texto (pipeline image-text-to-text), con torre de vision intacta respecto al modelo base.
- Codigo: HumanEval pass@1 de 0,939 en la configuracion medida.
- Matematicas: GSM8K de 0,948 en la configuracion medida.
- Abstención calibrada ante preguntas sin respuesta: 0,750 con prompt plano y 0,812 con prompt de anclaje en SQuAD-2.0.
- Tasas de rechazo muy bajas: 0 de 8 flags en chat y 1 de 8 en modo think.
- Decodificacion especulativa mediante MTP/DSpark con 5 tokens draft y verificacion adaptativa.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades de agente multi-paso: no documentadas explicitamente; el contexto de 1.048.576 tokens las hace tecnicamente viables, pero no se confirma soporte nativo.
- Cobertura multilingue: no disponible.

## Casos de uso

- Despliegue en cluster DGX Spark: el paquete esta preparado para TP4 sobre 4 nodos GB10 con anillo RoCE y se lanza con `flare orbit run` sobre el runtime estandar, sin parches, lo que reduce el trabajo de integracion a la aceptacion de la clave de firma de desarrollo.
- Atencion al cliente con contexto largo: la ventana de 1.048.576 tokens y el pool de KV de 36,3 millones de tokens permiten mantener historiales extensos y documentacion de referencia en la misma sesion sin truncar.
- Sistemas de respuesta con abstención controlada: en dominios donde fabricar es costoso (soporte regulatorio, documentacion medica o financiera de caracter informativo), la abstención de 0,750-0,812 sobre preguntas no respondibles reduce el riesgo de respuestas inventadas frente al 0,438-0,521 del paquete hermano.
- Procesamiento de documentos con imagen: al ser image-text-to-text, puede extraer y razonar sobre capturas, formularios escaneados o diagramas combinados con texto.
- Generacion de codigo en pipelines internos: con HumanEval de 0,939 puede integrarse en revision o autocompletado, siempre que el equipo asuma la licencia MIT y valide el comportamiento en su propio dominio.
- Asistentes internos sin filtros de rechazo excesivos: los 0/8 flags de rechazo en chat lo hacen adecuado para entornos donde los rechazos por defecto degradan la utilidad, con la contrapartida de requerir politicas de uso propias.
- Evaluacion comparativa de tecnicas de abliteration: sirve como referencia reproducible para investigar el equilibrio entre supresion de rechazo, abstención y degradacion de capacidades (KL de 0,131 frente al stock).

## Benchmarks y rendimiento

Medidos en un unico cluster de 4x DGX Spark (TP4, anillo RoCE) con un unico harness, respuestas generadas a temperatura y top-p fijos de 1,0 con thinking activado.

| Tarea | Stock Flare (LIL gb10) | Abliterated-FLARE | Uncensored-FLARE | WARMIND-FLARE (este repo) |
|---|---:|---:|---:|---:|
| MMLU (n=1425) | 0,8814 | 0,8849 | 0,8709 | 0,8786 |
| GPQA Diamond (n=198) | 0,697 | 0,702 | 0,7323 | 0,7071 |
| GSM8K (n=250) | 0,944 | 0,956 | 0,960 | 0,948 |
| HumanEval pass@1 (n=164) | 0,9512 | 0,939 | 0,9451 | 0,939 |
| KL vs stock, muestra de Pile (menor = mas cercano) | 0,100 (suelo de control) | 0,126 | 0,213 | 0,131 |
| Velocidad de serving C1 / C8 (tok/s) | 62,4 / 207,3 | 57,7 / 197,7 | 69,8 / 195,8 | 65,6 / 199,4 |
| Flags de rechazo, chat / think (de 8) | 4 / 5 | 0 / 2 | 0 / 0 | 0 / 1 |
| Abstención SQuAD-2.0 no respondibles, plano / anclado | no disponible | no disponible | 0,438 / 0,521 | 0,750 / 0,812 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el paquete esta dimensionado para 4 nodos DGX Spark con GB10 y no se documenta un perfil de un solo dispositivo.
- GPU recomendadas: 4x NVIDIA DGX Spark (GB10) en topologia TP4 con anillo RoCE. No se mencionan A100, H100 ni RTX 4090 como objetivo soportado.
- Cabe en GPU consumer: no disponible; DGX Spark es hardware de formato compacto con memoria unificada, pero el paquete requiere cuatro nodos.
- Opciones de despliegue: runtime `flare-inference` (APT) sin parches, lanzado con `flare orbit run`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 65,6 tok/s con concurrencia 1 y 199,4 tok/s con concurrencia 8, medidos con el harness del autor.
- Configuracion de serving: concurrencia maxima 32, contexto 1.048.576, pool de KV de 36.375.936 tokens, MTP/DSpark con 5 tokens draft y alpha 0,75.
- Firma: el paquete usa una clave de desarrollo local (namespace `local-development`), por lo que el primer arranque exige aceptar la confianza de esa clave copiando `development-publisher.json` a `~/.config/flare/`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU | HumanEval | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| WARMIND-FLARE (este repo) | no disponible | 1.048.576 | 0,8786 | 0,939 | MIT | paquete Flare, sin gate |
| Stock Flare (LIL gb10) | no disponible | no disponible | 0,8814 | 0,9512 | no disponible | paquete Flare de referencia |
| Abliterated-FLARE (hermano) | no disponible | no disponible | 0,8849 | 0,939 | no disponible | paquete Flare hermano |
| Uncensored-FLARE (hermano) | no disponible | no disponible | 0,8709 | 0,9451 | no disponible | paquete Flare hermano |

Los tres paquetes hermanos comparten base DeepSeek-V4.1-Flash-1017 y solo difieren en la edicion aplicada y el empaquetado. No se dispone de comparacion con modelos de otros proveedores.

## Limitaciones y advertencias

- Los benchmarks proceden de un unico cluster, un unico harness y un unico autor; no son resultados independientes ni comparables directamente con leaderboards publicos. Las cifras de KL son un metodo muestreado del lado del serving y deben leerse contra el control stock-vs-stock, no contra cero.
- El modelo es una variante abliterated: se ha eliminado la direccion de rechazo, lo que reduce las negativas por defecto a 0/8 en chat y 1/8 en think. Esto traslada al operador la responsabilidad de aplicar politicas de uso y filtros propios si el despliegue es publico.
- La abstención elevada (0,750-0,812) puede traducirse en respuestas evasivas en dominios donde el modelo deberia responder; conviene calibrar el prompt de anclaje segun el caso.
- Riesgo de alucinacion persistente: aunque la fabricacion baja a 0,250 en la muestra medida, sigue siendo una cuarta parte de las preguntas no respondibles.
- Idiomas soportados no declarados; no hay garantia documentada de calidad fuera del ingles evaluado.
- Licencia MIT declarada, lo que en principio permite uso comercial, pero la cadena de modelos base (DeepSeek-V4.1-Flash-1017 y WARMIND-1017) deberia verificarse por separado antes de un despliegue comercial.
- Dependencia fuerte de hardware y software concretos: TP4 sobre GB10, runtime Flare y una clave de firma de desarrollo local. No hay evidencia de funcionamiento en otros stacks.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion de la comunidad.
- La fecha de creacion indicada (2026-11-18) y las referencias a PRs de 2026 deben tratarse como datos del autor, no verificados de forma independiente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/woooflet/DeepSeek-V4.1-Flash-1017-warmind-FLARE
- Modelo base de la edicion: https://huggingface.co/jcartu/WARMIND-1017
- Modelo upstream: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Exportador Ignition (NVIDIA/spark-local-inference): https://github.com/NVIDIA/spark-local-inference (pin `972e28e44781d8d0c84d70ae434db92c36076a43`)
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada.
