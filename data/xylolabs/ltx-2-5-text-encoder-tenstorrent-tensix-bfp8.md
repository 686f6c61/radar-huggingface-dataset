# Xylolabs/LTX-2.5-Text-Encoder-Tenstorrent-Tensix-BFP8

## Resumen

LTX-2.5-Text-Encoder-Tenstorrent-Tensix-BFP8 es una conversión cuantizada del codificador de texto del modelo LTX-2.5 de Lightricks, adaptada específicamente para su ejecución sobre aceleradores Tenstorrent mediante la pila de software TTNN y el formato de coma flotante por bloques bfloat8_b (BFP8). No se trata de un modelo generativo autónomo, sino de un componente extraído del pipeline multimodal de LTX-2.5, empaquetado para su despliegue en hardware Tensix. El autor de la conversión es Xylolabs, que publica el artefacto como repositorio de tipo componente.

La relevancia de esta ficha radica en que documenta un caso poco habitual: la portabilidad de un codificador de texto de un modelo de generación de vídeo hacia una arquitectura de aceleración no convencional (Tenstorrent frente a NVIDIA/AMD), empleando cuantización BFP8 de bloques. Esto permite a equipos con hardware Tensix ejecutar la fase de codificación textual del pipeline LTX-2.5 sin depender de GPUs, aunque el repositorio no incluye el resto de componentes del sistema (VAE, transformador de difusión, decodificador de audio), por lo que por sí solo no habilita la generación de vídeo.

El repositorio tiene un tamaño de 26,1 GB, está publicado bajo la licencia comunitaria ltx-2.x-community-license-agreement y requiere acceso restringido (gated) en Hugging Face. En el momento de la consulta no registra descargas ni interacciones, y no se dispone de información pública sobre benchmarks, idiomas soportados ni detalles del dataset de entrenamiento del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (codificador de texto, componente del pipeline LTX-2.5); detalles de capas y dimensiones no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BFP8 (block floating point, formato bfloat8_b de Tenstorrent); pesos originales del modelo base presumiblemente en BF16/FP16, no confirmado |
| Idiomas soportados | no disponible |
| Licencia | ltx-2.x-community-license-agreement |
| Formato de pesos | pesos PyTorch para TTNN (pytorch, ttnn); no se indica safetensors ni GGUF |

## Arquitectura y entrenamiento

El artefacto es un codificador de texto perteneciente al modelo base Lightricks/LTX-2.5, un sistema multimodal de generación de vídeo con soporte de audio. La información disponible no detalla la arquitectura interna del codificador (número de capas, dimensión oculta, mecanismo de atención ni tokenizador), únicamente que se ha convertido a la pila TTNN de Tenstorrent y cuantizado en formato bfloat8_b, un esquema de coma flotante por bloques en el que un exponente compartido se aplica a grupos de mantisas de 8 bits. Este formato reduce el ancho de banda de memoria y el coste computacional en los núcleos Tensix a cambio de una pérdida de precisión controlada por bloque.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si el modelo base empleó RLHF, DPO u otras técnicas de alineación. Tampoco se documentan innovaciones técnicas específicas del codificador más allá de la propia cuantización BFP8 y la integración con TTNN. El repositorio referencia el paper arXiv:2601.03233, que presumiblemente describe el proceso de conversión o el soporte de LTX-2.5 en Tenstorrent, pero su contenido no se ha podido verificar en la información proporcionada.

## Capacidades

- Codificación de texto: transforma indicaciones textuales en representaciones latentes consumibles por el resto del pipeline LTX-2.5 (transformador de difusión y VAE).
- Integración en pipeline multimodal: forma parte del sistema de generación de vídeo con audio de Lightricks, aunque este repositorio solo contiene el codificador.
- Ejecución en hardware Tenstorrent: los pesos están adaptados a TTNN y al formato bfloat8_b, lo que permite su despliegue en aceleradores Tensix.
- Capacidades de generación de texto, razonamiento, código, matemáticas, tool calling, agentes o visión: no disponibles; el artefacto es un componente de codificación, no un modelo conversacional.
- Soporte multilingüe: no disponible.
- Modo thinking, audio o visión directa: no aplicable a este componente.

## Casos de uso

- Despliegue de LTX-2.5 en clústeres Tenstorrent: equipos con aceleradores Tensix pueden ejecutar la fase de codificación textual del pipeline de generación de vídeo sin recurrir a GPUs NVIDIA, siempre que dispongan del resto de componentes del sistema.
- Investigación en cuantización BFP8: el artefacto sirve como referencia para estudiar el impacto de bfloat8_b en la calidad de representaciones textuales dentro de un pipeline de difusión.
- Evaluación comparativa de backends: permite medir latencia y fidelidad del codificador en TTNN frente a la versión original en PyTorch/GPU, aislando el efecto de la cuantización.
- Prototipado de pipelines híbridos: combinación de un codificador en Tenstorrent con un transformador de difusión en GPU, repartiendo la carga entre hardware heterogéneo.
- Benchmarking de portabilidad: útil para validar herramientas de conversión de pesos (PyTorch a TTNN) en modelos multimodales de gran tamaño.
- Docencia y formación: ejemplo práctico de cuantización por bloques y de despliegue de componentes de modelos generativos en aceleradores no convencionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; el repositorio ocupa 26,1 GB, lo que sugiere pesos cuantizados de gran tamaño. La memoria necesaria depende del número de parámetros del codificador, dato no confirmado.
- GPU recomendadas: no aplica directamente; el artefacto está orientado a aceleradores Tenstorrent (Tensix), no a CUDA.
- Compatibilidad con GPU de consumo: no confirmada; los pesos en formato TTNN no son directamente ejecutables en RTX 4090 u otras GPUs consumer sin reconversión.
- Opciones de despliegue: pila TTNN de Tenstorrent; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Hardware objetivo | Disponibilidad |
|---|---|---|---|---|---|
| LTX-2.5-Text-Encoder-Tenstorrent-Tensix-BFP8 | no disponible | no disponible | ltx-2.x-community-license-agreement | Tenstorrent (TTNN) | Gated en Hugging Face |
| Lightricks/LTX-2.5 (modelo base) | no disponible | no disponible | ltx-2.x-community-license-agreement | GPU (PyTorch) | Hugging Face |
| Codificadores de texto de pipelines de vídeo comparables (p. ej. T5, CLIP) | variable | variable | variable | GPU/CPU | Amplia |

No se dispone de datos suficientes para una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Componente aislado: no genera vídeo ni texto por sí mismo; requiere el resto del pipeline LTX-2.5 (transformador de difusión, VAE, decodificador de audio).
- Acceso restringido: el repositorio es gated y exige aceptar la licencia comunitaria en Hugging Face, lo que limita su uso automatizado y su redistribución.
- Licencia restrictiva: ltx-2.x-community-license-agreement impone condiciones específicas para uso comercial; es imprescindible revisarlas antes de integrar el modelo en productos.
- Cuantización BFP8: la pérdida de precisión respecto a los pesos originales puede afectar a la fidelidad de las representaciones textuales; no se han publicado evaluaciones al respecto.
- Hardware específico: los pesos están adaptados a TTNN y no son portables a CUDA sin conversión adicional.
- Idiomas y sesgos: no se dispone de información sobre cobertura lingüística ni sobre sesgos conocidos del codificador.
- Riesgo de alucinación: no evaluable en este componente; depende del pipeline completo.
- Sin métricas publicadas: la ausencia de benchmarks y de descargas dificulta validar su calidad en producción.
- Fecha de publicación futura (2026): conviene verificar la vigencia y el soporte del repositorio antes de adoptarlo.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/LTX-2.5-Text-Encoder-Tenstorrent-Tensix-BFP8
- Modelo base: https://huggingface.co/Lightricks/LTX-2.5
- Paper referenciado: arXiv:2601.03233 (https://arxiv.org/abs/2601.03233)
- Tenstorrent TTNN: https://github.com/tenstorrent/tt-metal
- Licencia comunitaria LTX-2.x: disponible en la página del repositorio de Hugging Face
