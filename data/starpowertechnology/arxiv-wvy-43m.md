# StarpowerTechnology/arXiv-WVY-43M

## Resumen

arXiv-WVY-43M es un modelo de lenguaje autorregresivo compacto de 43 millones de parámetros desarrollado por StarpowerTechnology. Está diseñado como un modelo base de causal language modeling, entrenado exclusivamente con resúmenes (abstracts) de arXiv publicados por la Universidad de Cornell en Kaggle, junto con libros de ciencia y física. Su objetivo principal es servir como herramienta de investigación para experimentos con modelos de lenguaje muy pequeños, continuar preentrenamiento, fine-tuning y generación de texto científico.

El modelo emplea una arquitectura estilo DeepSeek-V3 con mezcla de expertos (MoE), aunque a una escala mínima: 6 capas transformer, 8 expertos enrutados y 1 experto compartido, con selección de 2 expertos por token. Esta configuración permite explorar las ventajas de las arquitecturas MoE en entornos de recursos limitados. El checkpoint no está ajustado por instrucciones, por lo que su uso directo se limita a tareas de modelado de lenguaje y generación de texto libre.

La relevancia de este modelo radica en su carácter experimental: demuestra que es posible aplicar arquitecturas modernas de alto rendimiento (como DeepSeek-V3) a escalas de parámetros muy reducidas, abriendo vías para investigación en eficiencia, destilación y comprensión de la dinámica de entrenamiento en modelos pequeños.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeepSeek-V3-style Causal Language Model (MoE) |
| Parametros totales | 43.489.608 |
| Parametros activos | 2 expertos seleccionados por token (de 8 enrutados) + 1 experto compartido |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en PyTorch float32/float16, sin cuantizaciones publicadas) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | PyTorch (model.pt), config.json, tokenizer.json, archivos Python de arquitectura |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de transformer causal con mezcla de expertos inspirada en DeepSeek-V3, pero reducida a 6 capas, 6 cabezas de atención, tamaño oculto de 384 y vocabulario de 24.000 tokens. La capa MoE cuenta con 8 expertos enrutados y 1 experto compartido, activando 2 expertos por token. Esta configuración permite que los parámetros activos por token sean una fracción del total, aunque al ser un modelo tan pequeño la ventaja computacional es limitada.

El entrenamiento se realizó sobre aproximadamente 726 millones de tokens observados, procedentes de títulos y resúmenes de artículos de arXiv (dataset de Cornell en Kaggle) y libros de ciencia/física. No se menciona el uso de técnicas de alineación como RLHF o DPO; se trata de un modelo base sin ajuste por instrucciones. El framework utilizado es PyTorch con Transformers, e incluye archivos personalizados de definición de arquitectura (`modeling_deepseek.py` y `configuration_deepseek.py`).

## Capacidades

- Generación de texto científico: dado un prompt sobre física, tecnología o ciencia, el modelo puede continuar con texto coherente en inglés, aunque con limitaciones propias de su tamaño.
- Modelado de lenguaje: capacidad de predecir el siguiente token, útil para experimentos de perplejidad y análisis de representaciones.
- Base para fine-tuning: al ser un modelo base, puede ser adaptado a tareas específicas mediante entrenamiento adicional.
- Exploración de arquitecturas MoE: permite estudiar el comportamiento de enrutamiento de expertos en modelos muy pequeños.
- Multilingüe: no, solo inglés (los datos de entrenamiento son abstracts de arXiv en inglés).

## Casos de uso

- Investigación académica en eficiencia de modelos: el modelo sirve como banco de pruebas para estudiar cómo se comportan las arquitecturas MoE a escalas mínimas, comparando con modelos densos del mismo tamaño.
- Experimentos de destilación: al ser pequeño y de código abierto, puede usarse como modelo profesor o alumno en pipelines de destilación de conocimiento.
- Generación de abstracts científicos sintéticos: puede producir borradores de resúmenes para artículos de física o tecnología, útiles como punto de partida para redacción.
- Fine-tuning para clasificación de textos científicos: al preentrenarse en abstracts de arXiv, puede adaptarse para clasificar documentos por área temática.
- Enseñanza y formación: es un modelo manejable para demostrar conceptos de transformers, MoE y generación de lenguaje en cursos de NLP.
- Prototipado rápido de aplicaciones de texto: aunque no está ajustado por instrucciones, puede integrarse en sistemas de autocompletado o generación de texto libre en dominios científicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar.

## Requisitos de hardware

- VRAM estimada para inferencia: con 43 millones de parámetros, el modelo en precisión float32 ocupa aproximadamente 174 MB de memoria. Con float16 serían unos 87 MB. Cabe en cualquier GPU moderna, incluso en CPUs.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente; una RTX 3060 o superior es más que adecuada. También puede ejecutarse en CPU sin problemas.
- Compatibilidad con GPU de consumo: sí, absolutamente. Es un modelo minúsculo.
- Opciones de despliegue: al ser un modelo PyTorch personalizado, se puede servir con vLLM si se adapta, o mediante Hugging Face Transformers con los archivos personalizados. También puede usarse con llama.cpp si se convierte a GGUF, aunque no hay conversiones publicadas.
- Latencia y throughput: no se han publicado mediciones, pero en una GPU moderna la generación debería ser de miles de tokens por segundo, dado el tamaño.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos dentro del mismo nicho (modelos MoE de ~43M entrenados en texto científico). Alternativas generales de tamaño similar incluyen modelos como GPT-2 small (124M, denso) o TinyLlama (1.1B, denso), pero no son directamente comparables por arquitectura y datos de entrenamiento. La comparativa no está disponible.

## Limitaciones y advertencias

- No está ajustado por instrucciones: no responde a prompts conversacionales ni sigue órdenes; solo genera texto libre.
- Dominio limitado: entrenado exclusivamente en abstracts de arXiv y libros de ciencia/física, por lo que su conocimiento de otros dominios es inexistente.
- Sesgos potenciales: los datos de arXiv pueden contener sesgos de género, geográficos o de área de investigación propios de la literatura científica.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar texto falso o inconsistente, especialmente en temas fuera de su dominio.
- Contexto limitado: al no especificarse la longitud de contexto, se desconoce su capacidad para manejar secuencias largas; probablemente sea reducida dado el tamaño.
- Uso comercial: la licencia MIT permite uso comercial sin restricciones, pero el modelo no es apto para producción sin un fine-tuning adecuado.
- Formato de pesos no estándar: requiere los archivos Python personalizados para cargarse, lo que puede dificultar su integración con herramientas estándar.

## Enlaces

- Hugging Face: https://huggingface.co/StarpowerTechnology/arXiv-WVY-43M
- Kaggle: https://www.kaggle.com/models/starpowertechnology/arxiv-wvy-43m
- Documentación de Starpower sobre WVY: https://starpower.technology/docs/wvy-opensource.html
- Sitio web de Starpower Technology: https://starpower.technology/
- Repositorio GitHub de WVY: https://github.com/StarpowerTechnology/WVY
- Perfil de GitHub de StarpowerTechnology: https://github.com/StarpowerTechnology/StarpowerTechnology
- Dataset de arXiv en Kaggle: https://www.kaggle.com/datasets/Cornell-University/arxiv
