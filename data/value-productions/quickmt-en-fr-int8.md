# value-productions/quickmt-en-fr-int8

## Resumen

quickmt-en-fr-int8 es una conversión del modelo de traducción automática quickmt/quickmt-en-fr, desarrollado originalmente por el proyecto quickmt y redistribuido por value-productions en formato CTranslate2 con pesos cuantizados a int8. El modelo resuelve la tarea de traducción directa inglés-francés y está pensado para su uso dentro de la aplicación Yaku Translate, que emplea CTranslate2 como motor de inferencia.

La relevancia de esta ficha es doble: por un lado, documenta una alternativa ligera y de licencia permisiva (CC BY 4.0) para traducción EN-FR en entornos con recursos limitados; por otro, ilustra el flujo habitual de redistribución de modelos de traducción en formato CTranslate2, que es el estándar de facto para despliegues de traducción neuronal de baja latencia en CPU.

No se dispone de información pública sobre el tamaño de parámetros, la arquitectura interna del modelo base ni los datos de entrenamiento más allá de lo indicado en la model card. El repositorio ocupa 0,2 GB, lo que sugiere un modelo compacto, compatible con despliegues en hardware modesto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de traducción (detalles no disponibles); empaquetado para CTranslate2 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (pesos cuantizados para CTranslate2); el original está en float16 |
| Idiomas soportados | inglés y francés (dirección EN-FR) |
| Licencia | CC BY 4.0 |
| Formato de pesos | CTranslate2 (int8); tokenizador SentencePiece (`joint.spm.model`, copiado como `src.spm.model` y `tgt.spm.model`) |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura del modelo base quickmt/quickmt-en-fr más allá de identificarlo como un modelo de traducción. El artefacto redistribuido es una conversión a CTranslate2 con cuantización int8 de los pesos, manteniendo el tokenizador SentencePiece conjunto (`joint.spm.model`) que se copia también como `src.spm.model` y `tgt.spm.model` para que las herramientas que esperan ficheros separados por dirección funcionen sin cambios.

El autor indica que las frases verificadas producen la misma salida que el original en float16, lo que sugiere que la cuantización int8 no degrada la calidad de forma perceptible en las comprobaciones realizadas. No hay información sobre el volumen de datos de entrenamiento, la composición del corpus, ni si se aplicaron técnicas de RLHF, DPO o fine-tuning adicional sobre el modelo base.

## Capacidades

- Traducción directa de inglés a francés.
- Uso de un tokenizador SentencePiece conjunto para origen y destino.
- Inferencia optimizada mediante CTranslate2, con pesos int8 para reducir requisitos de memoria y acelerar la ejecución en CPU.
- Integración prevista en la aplicación Yaku Translate.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- No se documenta soporte multilingüe más allá del par EN-FR.

## Casos de uso

- Traducción de documentación técnica EN-FR en pipelines de CI/CD: el modelo puede invocarse desde scripts de CTranslate2 para traducir ficheros Markdown o cadenas de recursos antes de publicar, con bajo coste computacional gracias a los pesos int8.
- Localización de interfaces de aplicaciones: al ser un modelo compacto y de licencia CC BY 4.0, encaja en la traducción de cadenas de UI en aplicaciones móviles o de escritorio, como demuestra su uso en Yaku Translate.
- Traducción por lotes de correos y comunicaciones internas: la cuantización int8 permite ejecutar el modelo en servidores sin GPU dedicada, procesando lotes de frases con latencia aceptable.
- Preprocesado de corpus para investigación: útil para generar traducciones de referencia rápidas en experimentos de PLN donde se necesita un baseline EN-FR ligero y de licencia permisiva.
- Traducción en el borde (edge): el tamaño reducido del repositorio (0,2 GB) y el formato CTranslate2 permiten desplegarlo en dispositivos con recursos limitados o en contenedores pequeños.
- Servicio de traducción de bajo coste en producción: al no requerir GPU, puede escalarse horizontalmente en CPU para cubrir picos de demanda de traducción EN-FR.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; al ser un modelo int8 de 0,2 GB en repositorio, es probable que quepa en menos de 1 GB de memoria, pero no se confirma.
- GPU recomendadas: no disponible; el formato CTranslate2 está optimizado para CPU, aunque también soporta GPU.
- Compatibilidad con GPU de consumo: previsiblemente sí, dado el tamaño reducido, pero no confirmado por el autor.
- Opciones de despliegue: CTranslate2 (formato nativo del artefacto); no se documentan otros formatos como GGUF, vLLM, TGI u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| quickmt-en-fr-int8 | no disponible | no disponible | CC BY 4.0 | CTranslate2 int8 | Conversión del original float16; uso en Yaku Translate |
| quickmt/quickmt-en-fr | no disponible | no disponible | CC BY 4.0 | float16 (formato original) | Modelo base del que deriva esta conversión |
| Otros modelos EN-FR | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

## Limitaciones y advertencias

- Solo traduce en la dirección inglés a francés; no se documenta la dirección inversa.
- No hay información sobre sesgos del corpus de entrenamiento ni sobre su comportamiento en dominios especializados (legal, médico, técnico).
- Riesgo de alucinación inherente a los modelos de traducción neuronal, especialmente en frases ambiguas o fuera de dominio; no se han publicado evaluaciones formales.
- La licencia CC BY 4.0 permite uso comercial con atribución; es necesario citar al autor original (quickmt) y respetar los términos de la licencia.
- No se especifica la longitud máxima de secuencia soportada, lo que puede provocar truncamientos en textos largos.
- El artefacto está empaquetado específicamente para CTranslate2; usarlo con otros motores requeriría conversión adicional.
- No se documentan métricas de calidad (BLEU, COMET) ni comparaciones con el original float16 más allá de la afirmación cualitativa del autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/value-productions/quickmt-en-fr-int8
- Modelo base: https://huggingface.co/quickmt/quickmt-en-fr
- CTranslate2 (repositorio): https://github.com/OpenNMT/CTranslate2
- Aplicación Yaku Translate: no disponible en la información proporcionada.
- Paper o blog del modelo: no disponible en la información proporcionada.
