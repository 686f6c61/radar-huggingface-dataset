# xThr45hx/G4_DGCO

# G4_DGCO: contenedores DGC0 para la NPU del Tensor G4

## Resumen

G4_DGCO es un repositorio de artefactos DGC0 (DarWINN Graph Container) compilados ahead-of-time (AOT) para la NPU EdgeTPU (darwinn) integrada en el SoC Google Tensor G4, el chip de la serie Pixel 9. No es un modelo entrenado por un laboratorio ni una publicación de pesos, sino un conjunto de contenedores de grafo en el formato binario que ejecuta el hardware, producidos en el propio dispositivo por el autor xThr45hx. Su interés radica en que aborda un problema poco documentado: cómo compilar y despachar modelos en una NPU cuyo compilador está cerrado y no documentado públicamente.

El repositorio incluye el sharding por capas de Gemma3-1B (cada capa del transformador compilada como un DGC0 independiente mediante "island chunking"), un DGC0 AOT de EmbeddingGemma-300M con secuencia 256, muestras de capas de Bonsai y un conjunto de DGC0 de operación única que cubren combinaciones de operación y cuantización (int8, int4, int2, ternary, fp8, fp16). El objetivo declarado es construir un mapa de micro-benchmarks por operación y cuantización para caracterizar la NPU.

El propio autor advierte de que la coherencia no está resuelta: los ficheros compilan y se despachan en la NPU, pero varios producen texto incoherente o basura, sobre todo con cuantización sub-byte agresiva (int4, int2, ternary). En consecuencia, debe interpretarse como material de investigación e ingeniería inversa, no como un LLM on-device utilizable.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Contenedores de grafo DGC0 (DarWINN Graph Container) AOT para la NPU EdgeTPU (darwinn) del Google Tensor G4; los grafos subyacentes son transformadores (Gemma3-1B, EmbeddingGemma-300M) y muestras de Bonsai |
| Parámetros totales | Variable según artefacto: Gemma3-1B ~1.000 millones, EmbeddingGemma-300M ~300 millones; Bonsai no disponible |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | EmbeddingGemma DGC0 con seq256; Gemma3-1B y Bonsai no disponible |
| Tipos de cuantización | int8, int4, int2, ternary, fp8, fp16 (en `toy-ops`); la coherencia en cuantización sub-byte (int4/int2/ternary) no está resuelta |
| Idiomas soportados | no disponible |
| Licencia | other (artefactos derivados). Modelos fuente: Gemma3-1B y EmbeddingGemma bajo Gemma Terms of Use; Bonsai bajo su licencia upstream |
| Formato de pesos | DGC0 (bytecode EdgeTPU / DarWINN Graph Container) |

## Arquitectura y entrenamiento

El repositorio no contiene pesos de un modelo entrenado, sino artefactos compilados. Cada fichero `island_L##-##.dgc0` corresponde a una capa de transformador de Gemma3-1B compilada de forma aislada y despachada en la NPU mediante la instrucción `VII_COMMAND`. La técnica de "island chunking" permite trocear un modelo por capas y compilar cada una como un DGC0 independiente, sorteando las limitaciones del compilador cerrado. Para EmbeddingGemma-300M se publica un único DGC0 AOT con secuencia 256, y para Bonsai solo muestras de capas.

No se detalla información sobre datos de entrenamiento, número de tokens, composición del dataset ni procesos de alineación (RLHF/DPO), ya que los modelos fuente se toman como entradas y aquí solo se distribuye su forma compilada. La aportación técnica es el pipeline de compilación AOT hacia DGC0, desarrollado mediante dos toolchains de ingeniería inversa independientes (documentadas en el repositorio `Tensor-G4-NPU-Compiler-Toolchains`) y el conjunto `toy-ops`, pensado como semilla de un mapa de micro-benchmarks por operación y cuantización de la NPU del G4.

## Capacidades

- Compilación y despacho de grafos en la NPU EdgeTPU del Tensor G4: los DGC0 se cargan y ejecutan vía la pila DarWINN (`libLiteRtDispatch_GoogleTensor` → Tachyon → `VII_COMMAND`).
- Sharding de transformadores por capas: cada capa de Gemma3-1B se compila como un DGC0 independiente.
- Generación de embeddings on-device: DGC0 AOT de EmbeddingGemma-300M con secuencia 256.
- Cobertura de operaciones y cuantizaciones: DGC0 de operación única para int8, int4, int2, ternary, fp8 y fp16, orientados a micro-benchmarking.
- Ejecución de inferencia en el dispositivo: varios artefactos se despachan correctamente en la NPU.
- Generación de texto coherente: no garantizada; el propio autor indica que parte de los DGC0 producen texto incoherente o basura (capacidad no conseguida).
- Tool calling, agentes, visión, audio y modo de razonamiento: no disponible.
- Capacidades multilingües: no disponible.

## Casos de uso

- Caracterización de la NPU del Tensor G4: usar los DGC0 de `toy-ops` para medir cobertura de operaciones, fusión, tiling/alineación y roofline por tipo de cuantización, construyendo un mapa de rendimiento del acelerador.
- Ingeniería inversa de toolchains de compilación: emplear los artefactos como material de referencia para validar y depurar las dos toolchains de compilación DGC0 publicadas por el mismo autor.
- Investigación en cuantización sub-byte: estudiar por qué la inferencia con int4, int2 y ternary compila y se despacha pero no genera texto coherente, aislando el fallo por operación y por capa.
- Sharding de modelos grandes por capas en NPU: experimentar con la técnica de island chunking para evaluar si un transformador puede trocearse y despacharse capa a capa en hardware con memoria limitada.
- Embeddings on-device para RAG: desplegar el DGC0 de EmbeddingGemma-300M (seq256) como generador de vectores local en un Pixel 9, según el flujo Termux + MCP descrito por el autor.
- Reproducibilidad de compilación AOT: verificar si los binarios publicados se reproducen en un Tensor G4 rooteado y comparar el resultado con las muestras de Bonsai y Gemma3-1B.
- Docencia y divulgación sobre aceleradores móviles: ilustrar el ciclo completo de compilación AOT, despacho en NPU y validación de coherencia con un caso real de hardware cerrado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio `toy-ops` se describe como la semilla de un mapa de micro-benchmarks por operación y cuantización, pero no se ofrecen cifras de latencia, throughput ni métricas de calidad (MMLU, HumanEval, GSM8K u otras).

## Requisitos de hardware

- Plataforma de ejecución: dispositivo con SoC Google Tensor G4 (por ejemplo, Pixel 9) con root. La pila de despacho es `libLiteRtDispatch_GoogleTensor` → Tachyon → `VII_COMMAND`.
- VRAM de GPU: no aplica; los DGC0 son bytecode específico de la NPU EdgeTPU y no se ejecutan en GPU de consumo ni en CPU mediante runtimes convencionales.
- GPU recomendadas (A100, H100, RTX 4090): no aplica.
- Ejecución en GPU de consumo: no es posible; no existe ruta de compilación ni despacho de DGC0 fuera de la NPU del Tensor G4.
- Memoria de dispositivo: los modelos fuente (Gemma3-1B ~1.000 millones, EmbeddingGemma-300M) caben en la memoria del terminal, pero su funcionamiento depende del despacho en NPU.
- Tamaño del repositorio: 0,8 GB.
- Opciones de despliegue: pila DarWINN sobre Tensor G4 rooteado, siguiendo la documentación del directorio `g4-pixel/` del repositorio GitHub. vLLM, llama.cpp, Ollama y TGI no aplican porque no interpretan el formato DGC0.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se conoce un conjunto público de artefactos DGC0 directamente comparable para el Tensor G4. La comparación más útil es con los modelos fuente incluidos en el repositorio:

| Modelo fuente | Parámetros | Contexto | Licencia | Estado en este repositorio |
|---|---|---|---|---|
| Gemma3-1B | ~1.000 millones | no disponible | Gemma Terms of Use | Shardeado por capas en DGC0; coherencia no resuelta |
| EmbeddingGemma-300M | ~300 millones | seq256 | Gemma Terms of Use | DGC0 AOT funcional para embeddings |
| Bonsai | no disponible | no disponible | licencia upstream | Muestras de capas en DGC0 |

| Alternativa | Naturaleza | Formato | Hardware objetivo | Licencia |
|---|---|---|---|---|
| G4_DGCO (este repositorio) | Artefactos AOT compilados | DGC0 | NPU Tensor G4 (Pixel 9 rooteado) | other |
| Tensor-G4-NPU-Compiler-Toolchains | Toolchains de ingeniería inversa | No aplica (herramientas) | Tensor G4 | no disponible |
| LiteRT-LM | Runtime on-device de Google | no disponible | Móviles con Tensor | no disponible |

## Limitaciones y advertencias

- Coherencia no resuelta: varios DGC0 compilan y se despachan en la NPU pero producen texto incoherente o basura. No debe tratarse como un LLM on-device funcional.
- Cuantización sub-byte problemática: int4, int2 y ternary son el punto donde falla la generación coherente, según el propio autor.
- Requiere dispositivo rooteado: la ejecución depende de un Tensor G4 con root y de la pila DarWINN; no hay ruta en hardware no soportado.
- Licencia "other": los artefactos son compilaciones derivadas. Gemma3-1B y EmbeddingGemma quedan sujetos a los Gemma Terms of Use, y Bonsai a su licencia upstream; deben revisarse antes de cualquier uso comercial.
- Sin benchmarks: no hay métricas publicadas de calidad, latencia ni throughput, lo que impide comparar el rendimiento real.
- Alcance limitado a un SoC: todo el contenido es específico del Tensor G4; no es portable a otras NPU ni a GPU.
- Riesgo de alucinación: no evaluable, dado que no se ha demostrado generación coherente.
- Idiomas y sesgos: no disponible.
- Naturaleza experimental: es material de investigación e ingeniería inversa, no un producto listo para producción.

## Enlaces

- HuggingFace: https://huggingface.co/xThr45hx/G4_DGCO
- Perfil del autor en HuggingFace: https://huggingface.co/xThr45hx
- Toolchains de compilación para la NPU del Tensor G4: https://huggingface.co/xThr45hx/Tensor-G4-NPU-Compiler-Toolchains
- Repositorio GitHub (tooling y write-up): https://github.com/qbnasasn/Google-Tensor-Chips
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
