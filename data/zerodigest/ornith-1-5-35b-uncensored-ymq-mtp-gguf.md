# zerodigest/Ornith-1.5-35B-Uncensored-YMQ-MTP-GGUF

## Resumen

Ornith-1.5-35B-Uncensored-YMQ-MTP-GGUF es una colección de cuantizaciones GGUF del modelo base Ornith-1.5-35B-A3B-Uncensored, desarrollada por el usuario ZeroDigest (zerodigest) mediante el framework propietario YMQ-Compiler v2.0. El modelo base, creado por 0xKitkat a partir del Ornith-1.5-35B-A3B de ornith-ai, es un modelo de lenguaje de tipo Mixture of Experts (MoE) con 35.505 millones de parámetros totales y aproximadamente 3 mil millones de parámetros activos (según la nomenclatura A3B). La licencia es Apache 2.0, lo que permite uso comercial y modificación.

La relevancia de esta versión cuantizada radica en su enfoque "architecture-aware": en lugar de aplicar una cuantización uniforme, el YMQ-Compiler protege las capas de atención y las rutas de enrutamiento MoE con bits altos (Q5_K, Q6_K) mientras comprime agresivamente los expertos de fondo con bits bajos (IQ2_XS, IQ4_NL). Esto permite mantener una baja perplejidad y estabilidad lógica en tareas de razonamiento con contexto largo, especialmente pensado para agentes de codificación locales como RooCode o Aider. Se ofrecen tres presets (S, M y L) con tamaños de archivo de aproximadamente 13.4 GB, 16.2 GB y 18.6 GB respectivamente, siendo el preset M el recomendado por el autor por su equilibrio entre calidad y uso de VRAM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts), 35B totales, 3B activos (segun nomenclatura A3B); detalles de capas no disponibles |
| Parametros totales | 35.505.251.456 (35.5B) |
| Parametros activos | 3B (segun nomenclatura A3B, no confirmado en la model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | YMQ (mixed precision) - presets S (~13.4 GB), M (~16.2 GB), L (~18.6 GB); usa IQ2_XS, IQ4_NL, IQ4_XS, IQ3_XXS, Q5_K, Q6_K |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-35B-A3B es un MoE con 35.5 mil millones de parámetros totales y aproximadamente 3 mil millones de parámetros activos, como indica su nombre. No se dispone de información detallada sobre el número de expertos, la configuración de capas o el mecanismo de atención en la documentación proporcionada. La página oficial de ornith.ai describe Ornith-1.5 como un modelo que extiende el framework de "self-scaffolding" de Ornith-1.0 hacia un bucle de auto-mejora: el modelo propone nuevas tareas, genera scaffolds específicos y produce rollouts de soluciones para aprendizaje por refuerzo, creando continuamente nuevas experiencias de aprendizaje. Sin embargo, no se especifican los datos de entrenamiento (número de tokens, composición del dataset) ni si se usaron técnicas como RLHF o DPO.

La cuantización YMQ aplicada en este repositorio es una técnica de compresión post-entrenamiento que opera en espacio logarítmico. El compilador identifica estadísticamente los clústeres de pesos críticos (capas de atención, rutas de enrutamiento MoE) y los protege con cuantizaciones de alta fidelidad (Q5_K, Q6_K), mientras comprime los pesos de los expertos de fondo, que constituyen la mayor parte del archivo pero rara vez se activan simultáneamente, con formatos de baja precisión (IQ2_XS, IQ4_NL). Además, aplica un "fading boundary tapering" en las primeras capas (L00=IQ4_NL, L01=IQ4_XS, L02=IQ3_XXS) para estabilizar la entrada de tokens, y un "dedicated gate insulation" que protege los caminos de atención y enrutamiento. Este enfoque busca preservar la topología de enrutamiento MoE y evitar la degradación lógica en contextos largos.

## Capacidades

- Generacion de texto y razonamiento: el modelo base es un LLM generalista con capacidades de razonamiento, aunque no se aportan benchmarks específicos en la informacion disponible.
- Generacion de codigo: la model card indica que esta optimizado para entornos de agentes de codificacion locales como RooCode o Aider, lo que sugiere un buen rendimiento en tareas de programacion.
- Soporte de agentes y multi-step reasoning: la cuantizacion YMQ esta disenada para "deep agent context loops", lo que implica que el modelo puede mantener cadenas de razonamiento largas y multiples pasos en un contexto extenso.
- Modelo "uncensored": el nombre y la descripcion indican que se ha eliminado la censura del modelo base, lo que permite generar contenido sin restricciones de seguridad (con los riesgos asociados).
- Capacidades multilingues: no disponible.
- Tool calling / function calling: no confirmado en la informacion proporcionada, aunque es probable en un modelo orientado a agentes.
- Vision o audio: no disponible; el modelo base parece ser solo de texto.

## Casos de uso

- Agentes de codificacion locales: el preset M (16.2 GB) esta recomendado para ejecutar agentes como RooCode o Aider en una GPU de 24 GB, dejando margen de VRAM para contextos largos y multiples iteraciones de razonamiento.
- Asistente de programacion en IDE: puede integrarse en editores como VS Code o Neovim para autocompletado, generacion de funciones y refactorizacion, aprovechando su capacidad de razonamiento multi-paso.
- Chat sin censura para investigacion: al ser "uncensored", permite explorar temas sensibles o generar contenido creativo sin filtros, util en entornos academicos o de analisis de riesgos.
- Generacion de codigo en produccion: si se confirma el soporte de tool calling, podria integrarse en pipelines de CI/CD para generar tests, documentacion o parches, aunque se requiere validacion adicional.
- Analisis de documentos largos: gracias a la optimizacion para contexto largo (aunque no se especifica la longitud maxima), puede resumir o extraer informacion de documentos extensos en una sola pasada.
- Experimentacion con MoE cuantizados: para investigadores interesados en tecnicas de compresion mixta y su impacto en la calidad de modelos de mezcla de expertos, este repositorio ofrece una implementacion documentada con metricas de perplejidad.

## Benchmarks y rendimiento

La unica metrica publicada es la perplejidad en WikiText-2 (contexto de 4096 tokens), evaluada con llama-perplexity. No se han publicado resultados de MMLU, HumanEval, GSM8K u otros benchmarks estandar.

| Preset | Tamano de archivo | Perplejidad (WikiText-2, menor es mejor) |
| :--- | :--- | :--- |
| S | ~13.4 GB | 13.5454 |
| M (recomendado) | ~16.2 GB | 12.4310 |
| L | ~18.6 GB | 12.5107 |

El preset M obtiene la mejor perplejidad, incluso superando al preset L, lo que el autor atribuye a la proteccion selectiva de las rutas de atencion y enrutamiento mientras se comprimen los expertos de fondo.

## Requisitos de hardware

- Preset S (~13.4 GB): cabe en GPUs con 16 GB de VRAM (por ejemplo, RTX 4080, RTX 4090 con cuantizacion adicional, o A5000). Deja poco margen para contexto largo.
- Preset M (~16.2 GB): requiere al menos 20-24 GB de VRAM para dejar margen de contexto. Adecuado para RTX 4090 (24 GB), A5000 (24 GB) o A6000 (48 GB).
- Preset L (~18.6 GB): necesita 24 GB o mas de VRAM. En una RTX 4090 apenas cabe sin contexto adicional; se recomienda una GPU de 48 GB o mas.
- Opciones de despliegue: al ser GGUF, es compatible con llama.cpp, Ollama, LM Studio y otros motores que soporten este formato. Tambien puede usarse con vLLM si se convierte a otro formato, aunque no esta confirmado.
- Latencia y throughput: no disponibles. La cuantizacion YMQ no publica mediciones de velocidad.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos en la informacion proporcionada. El modelo base Ornith-1.5-35B-A3B pertenece a la categoria de MoE de ~35B totales con ~3B activos, similar a Qwen3-30B-A3B o DeepSeek-V3-Lite, pero no se han publicado benchmarks comparativos. La cuantizacion YMQ es propietaria de ZeroDigest, por lo que no hay alternativas directas con la misma tecnica.

## Limitaciones y advertencias

- Modelo "uncensored": al eliminar la censura, el modelo puede generar contenido dañino, ilegal o inapropiado. No debe desplegarse en entornos de produccion sin salvaguardas adicionales.
- Riesgo de alucinacion: no se han publicado metricas especificas, pero es un riesgo inherente a los LLM, especialmente en tareas de codigo o razonamiento complejo.
- Longitud de contexto no especificada: aunque la cuantizacion esta optimizada para contexto largo, no se indica el maximo de tokens soportado. El usuario debe probar con su carga de trabajo.
- Idiomas: no se especifican los idiomas soportados; probablemente el modelo base este entrenado principalmente en ingles.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base (Ornith-1.5-35B-A3B) puede tener restricciones adicionales no documentadas en este repositorio.
- La cuantizacion YMQ es una tecnica propietaria: aunque el modelo resultante es de codigo abierto, el proceso de cuantizacion no esta documentado de forma completa, lo que dificulta la reproducibilidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/zerodigest/Ornith-1.5-35B-Uncensored-YMQ-MTP-GGUF
- Modelo base (0xKitkat): https://huggingface.co/0xKitkat/Ornith-1.5-35B-A3B-Uncensored
- Modelo original (ornith-ai): https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Pagina oficial de Ornith-1.5: https://ornith.ai/ornith_1_5.html
- Repositorio GitHub de una variante relacionada (AEON Ultimate Uncensored): https://github.com/AEON-7/Ornith-1.0-35B-AEON-Ultimate-Uncensored
