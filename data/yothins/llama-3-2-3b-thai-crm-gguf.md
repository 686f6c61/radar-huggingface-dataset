# yothinS/Llama-3.2-3B-Thai-CRM-GGUF

## Resumen

Llama 3.2 3B Thai CRM GGUF es una version cuantizada en formato GGUF del modelo yothinS/Llama-3.2-3B-Thai_CRM, un ajuste fino del modelo base Llama 3.2 3B de Meta orientado a flujos de trabajo de gestion de relaciones con clientes (CRM), comunicacion empresarial en tailandes y analisis del comportamiento del cliente. Lo publica el usuario yothinS en HuggingFace y esta pensado para ejecutarse en local sobre CPU, Apple Silicon o GPU de NVIDIA y AMD mediante llama.cpp, Ollama, LM Studio o text-generation-webui.

El modelo cuenta con 3.212.749.888 parametros (aproximadamente 3,2 mil millones) y esta disponible en seis niveles de cuantizacion que van desde Q2_K (1,36 GB) hasta Q8_0 (3,42 GB). Su proposito es cubrir tareas de atencion al cliente y marketing en entornos donde el tailandes es el idioma principal de negocio, con soporte adicional de ingles. Al derivar de Llama 3.2 3B, hereda la arquitectura transformer decoder-only del modelo base, aunque la informacion disponible no detalla la longitud de contexto efectiva tras el ajuste.

La relevancia de esta ficha radica en que se trata de un modelo de nicho (CRM en tailandes) distribuido ya cuantizado, lo que reduce la barrera de despliegue en hardware modesto. Sin embargo, la informacion publica es escasa en cuanto a datos de entrenamiento y rendimiento, por lo que gran parte de las especificaciones quedan marcadas como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Llama 3.2 3B) |
| Parametros totales | 3.212.749.888 (aproximadamente 3,2 mil millones) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q2_K, Q3_K_M, Q4_K_M, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | Ingles (en) y tailandes (th) |
| Licencia | llama3.2 (Llama 3.2 Community License) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del modelo base Llama 3.2 3B, que es un transformer decoder-only con atencion causal, publicado originalmente por Meta. Sobre esa base, el autor ha realizado un ajuste especifico para dominios de CRM, comunicacion empresarial en tailandes y analisis del comportamiento del cliente. El repositorio resultante se distribuye exclusivamente en formato GGUF, generado a partir del modelo ajustado yothinS/Llama-3.2-3B-Thai_CRM.

La informacion disponible no especifica el numero de tokens utilizados en el ajuste, la composicion del dataset de entrenamiento, ni si se emplearon tecnicas de alineacion como RLHF, DPO o SFT. La etiqueta unsloth sugiere que el ajuste se realizo con la libreria Unsloth, orientada a entrenamiento eficiente en memoria, pero no se aportan mas detalles tecnicos sobre el proceso. Tampoco se indica si se introdujeron innovaciones como decodificacion especulativa o variantes de atencion.

## Capacidades

- Generacion de texto orientada a dominios de negocio, con enfasis en comunicacion comercial en tailandes.
- Soporte para flujos de trabajo de CRM: clasificacion de consultas, redaccion de respuestas, resumen de interacciones con clientes.
- Analisis del comportamiento del cliente segun la descripcion del autor.
- Capacidad multilingue limitada a ingles (en) y tailandes (th).
- Ejecucion local mediante llama.cpp, Ollama, LM Studio y text-generation-webui gracias al formato GGUF.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo de razonamiento explicito (thinking mode), vision o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Atencion al cliente en tailandes: el modelo puede generar respuestas automatizadas a consultas entrantes redactadas en tailandes, manteniendo un registro comercial adecuado al contexto empresarial local.
- Clasificacion y enrutado de tickets de CRM: se puede emplear para etiquetar consultas por categoria (soporte, ventas, reclamacion) antes de derivarlas al equipo correspondiente.
- Resumen de conversaciones con clientes: utilidad para condensar hilos largos de interaccion en resumenes breves que alimenten el historial del CRM.
- Generacion de comunicaciones de marketing en tailandes: redaccion de correos, mensajes promocionales o respuestas tipo adaptadas al tono de negocio tailandes.
- Analisis de sentimiento y comportamiento del cliente: extraccion de senales sobre satisfaccion o intencion de compra a partir de textos de interaccion.
- Despliegue en local para pymes: al ejecutarse en formato GGUF con cuantizaciones de 1,36 GB a 3,42 GB, permite montar asistentes de CRM sin depender de servicios en la nube ni enviar datos de clientes a terceros.
- Prototipado rapido en entornos con hardware limitado: adecuado para pruebas de concepto sobre portatiles o mini-PC con CPU, usando Q4_K_M como punto de partida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Q2_K: 1,36 GB de archivo, aproximadamente 3,0 GB de RAM/VRAM. Perdida de calidad significativa, solo para pruebas en memoria ultrabaja.
- Q3_K_M: 1,69 GB de archivo, aproximadamente 3,5 GB de RAM/VRAM. Bajo consumo, con perdida apreciable en razonamiento complejo.
- Q4_K_M: 2,02 GB de archivo, aproximadamente 4,0 GB de RAM/VRAM. Equilibrio recomendado entre calidad, velocidad y tamano.
- Q5_K_M: 2,32 GB de archivo, aproximadamente 4,5 GB de RAM/VRAM. Alta fidelidad, preserva matices en la generacion de tokens en tailandes.
- Q6_K: 2,64 GB de archivo, aproximadamente 5,0 GB de RAM/VRAM. Rendimiento muy cercano al original de 16 bits.
- Q8_0: 3,42 GB de archivo, aproximadamente 5,8 GB de RAM/VRAM. Salida practicamente identica a los pesos sin cuantizar en FP16/BF16.
- GPU recomendadas: no disponibles de forma especifica; dado el tamano, cabe en GPU de consumo como RTX 3060, RTX 4060, RTX 4090 (con margen amplio), asi como en Apple Silicon y CPU.
- Opciones de despliegue: llama.cpp (CLI), Ollama, LM Studio y text-generation-webui. Tamano del repositorio completo: 19,9 GB (incluye todas las cuantizaciones).
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Llama 3.2 3B Thai CRM GGUF (este modelo) | 3,2 mil millones | en, th | llama3.2 | GGUF | Ajuste de nicho para CRM en tailandes |
| Llama 3.2 3B (base/Instruct, Meta) | 3,2 mil millones | multilingue (incluye en) | llama3.2 | safetensors, GGUF | Modelo base sin ajuste especifico de CRM; tailandes no es idioma oficialmente soportado |
| Alternativas de ~3B para CRM en tailandes | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la informacion proporcionada |

Dado que no se han publicado resultados de benchmarks, la comparacion cuantitativa de rendimiento entre estos modelos no puede establecerse con los datos disponibles.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la informacion proporcionada; al derivar de Llama 3.2, puede heredar sesgos del modelo base y de los datos de ajuste.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; en dominios de CRM y atencion al cliente, conviene validar las respuestas antes de enviarlas a usuarios finales.
- Limitaciones de idioma: el soporte se limita a ingles y tailandes; no hay evidencia de rendimiento en castellano u otros idiomas.
- Longitud de contexto: no especificada tras el ajuste; se desconoce si se ha preservado la ventana amplia del modelo base.
- Licencia: se aplica la Llama 3.2 Community License, que impone condiciones de uso (por ejemplo, obligaciones de atribucion y restricciones para determinados usos). Es necesario revisar sus terminos antes de un uso comercial.
- Ausencia de benchmarks publicados: dificulta la evaluacion objetiva del rendimiento respecto a alternativas.
- Adopcion limitada: el repositorio cuenta con 104 descargas y 1 like en el momento de la consulta, lo que sugiere poca validacion por parte de la comunidad.
- Escasa documentacion tecnica del ajuste: no se detallan datos de entrenamiento, hiperparametros ni proceso de alineacion, lo que complica auditar el modelo para produccion.

## Enlaces

- HuggingFace (GGUF): https://huggingface.co/yothinS/Llama-3.2-3B-Thai-CRM-GGUF
- Modelo base ajustado: https://huggingface.co/yothinS/Llama-3.2-3B-Thai_CRM
- llama.cpp: https://github.com/ggerganov/llama.cpp
