# sudhanshu42844/mixtral-healthcare-pretrained-from-scratch

## Resumen

`sudhanshu42844/mixtral-healthcare-pretrained-from-scratch` es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) disperso, entrenado desde cero por el usuario sudhanshu42844 y publicado en Hugging Face. A pesar del nombre "mixtral", no es una variante oficial de Mistral AI ni deriva de los pesos de Mixtral: se trata de una implementación propia con arquitectura "mixtral-style" según los tags del repositorio, orientada al dominio sanitario y biomédico.

El modelo cuenta con 38.779.008 parámetros totales según los pesos en safetensors, lo que lo sitúa en la categoría de modelos pequeños (del orden de decenas de millones de parámetros). Está entrenado exclusivamente en inglés sobre el dataset `common-pile/pubmed_filtered`, un subconjunto de PubMed filtrado, lo que lo especializa en texto biomédico y literatura científica del ámbito de la salud.

Su relevancia es limitada en términos prácticos: se publica como ejercicio de preentrenamiento from scratch, con cero descargas y cero likes en el momento de la ficha, acceso restringido (gated) y sin licencia declarada. Resulta útil como referencia técnica para estudiar arquitecturas MoE de pequeño tamaño aplicadas a dominios especializados, pero no como modelo de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) disperso, estilo Mixtral (transformer) |
| Parametros totales | 38.779.008 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin GGUF publicado) |
| Idiomas soportados | ingles (en) |
| Licencia | no disponible |
| Formato de pesos | safetensors (PyTorch) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer con capas de mezcla de expertos dispersa (sparse MoE) al estilo de Mixtral, según los tags `mixtral-style`, `mixture-of-experts` y `sparse-moe`. No se dispone de información pública sobre el número de capas, dimensión oculta, número de expertos, top-k de enrutamiento ni dimensión de las cabezas de atención. Tampoco se especifica la longitud de contexto nativa ni la estrategia de tokenización empleada.

El entrenamiento se realizó desde cero (`from-scratch`) sobre el dataset `common-pile/pubmed_filtered`, un corpus de literatura biomédica filtrada de PubMed. No hay información disponible sobre el número total de tokens de entrenamiento, la composición exacta del dataset, si se aplicaron fases de instrucción (SFT), alineación (RLHF/DPO) o si el modelo es únicamente un modelo base de modelado de lenguaje. No se documentan innovaciones técnicas adicionales como decodificación especulativa, atención lineal o variantes híbridas.

## Capacidades

- Generación de texto en inglés orientada a dominio biomédico y literatura científica.
- Modelado de lenguaje autoregresivo (pipeline `text-generation`).
- Especialización léxica y semántica en terminología médica y sanitaria derivada del corpus PubMed.
- Capacidad de continuación de texto técnico y abstracts científicos en inglés.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingüe más allá del inglés.
- No se documenta modo thinking, visión, audio ni otras modalidades.
- No se documenta entrenamiento por instrucciones; se trata presumiblemente de un modelo base.

## Casos de uso

- Estudio de arquitecturas MoE de pequeño tamaño: el modelo sirve como referencia didáctica para analizar cómo se distribuye un presupuesto de 38,8 M de parámetros en un diseño MoE disperso, útil en docencia e investigación sobre eficiencia.
- Experimentos de dominio biomédico en inglés: continuación y generación de abstracts o párrafos técnicos sobre literatura PubMed, aprovechando el preentrenamiento sobre `common-pile/pubmed_filtered`.
- Base para fine-tuning ligero: al ser un modelo pequeño (0,2 GB de repo), puede ajustarse en una única GPU consumer para tareas específicas de clasificación o extracción de entidades biomédicas, partiendo de un conocimiento de dominio ya adquirido.
- Prototipado rápido en investigación académica: su reducido tamaño permite iterar sobre pipelines de generación en local sin infraestructura dedicada.
- Evaluación comparativa de tokenizadores y curvas de escalado: útil para estudiar el efecto del preentrenamiento desde cero en corpus especializados frente a modelos generalistas.
- Reproducción de experimentos de preentrenamiento: sirve como punto de partida documentado (aunque parcialmente) para replicar recetas de entrenamiento from scratch en dominios verticales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (38,8 M de parámetros ≈ 155 MB de pesos) y del orden de 40-80 MB en cuantizaciones de 8 o 4 bits, aunque no se publican versiones GGUF.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.) e incluso CPU es suficiente; no requiere A100 ni H100.
- Cabe holgadamente en cualquier GPU consumer y en entornos de CPU.
- Opciones de despliegue: PyTorch nativo (librería declarada); no se confirma compatibilidad con vLLM, llama.cpp, Ollama ni TGI al no haber pesos GGUF ni configuración publicada.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| sudhanshu42844/mixtral-healthcare-pretrained-from-scratch | 38,8 M | no disponible | no disponible | Gated, 0 descargas |
| Modelos biomédicos tipo PubMedBERT / BioBERT | ~110 M | 512 tokens (habitual) | MIT / Apache-2.0 (segun variante) | Publicos, ampliamente usados |
| Modelos MoE pequeños de referencia (p. ej. variantes tipo Switch Transformer reducidas) | variable | variable | variable | Publicos en investigacion |

La comparación directa es limitada: no se dispone de datos de benchmarks del modelo para contrastar rendimiento frente a alternativas biomédicas consolidadas como PubMedBERT o BioBERT, que además cuentan con licencias claras y amplia adopción.

## Limitaciones y advertencias

- Ausencia de licencia declarada: no se especifican condiciones de uso comercial, lo que impide su adopción en producción con garantías legales.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que añade fricción para su uso y reproducibilidad.
- Modelo base sin alineación documentada: probablemente sin SFT ni RLHF, por lo que puede generar texto incoherente o inapropiado en contextos conversacionales.
- Riesgo elevado de alucinación en contenido médico: cualquier salida en dominio sanitario no debe usarse como consejo clínico sin validación experta.
- Dominio y idioma muy restringidos: solo inglés y exclusivamente literatura PubMed; el rendimiento fuera de ese dominio será previsiblemente pobre.
- Cero tracción comunitaria (0 descargas, 0 likes) y documentación mínima: sin model card detallada, sin benchmarks y sin garantías de mantenimiento.
- Tamaño muy reducido (38,8 M de parámetros): capacidad limitada de razonamiento, conocimiento factual y coherencia en contextos largos.
- No se documentan parámetros activos, contexto ni detalles de enrutamiento MoE, lo que dificulta evaluar su eficiencia real.

## Enlaces

- Hugging Face: https://huggingface.co/sudhanshu42844/mixtral-healthcare-pretrained-from-scratch
- Dataset de entrenamiento: https://huggingface.co/datasets/common-pile/pubmed_filtered
