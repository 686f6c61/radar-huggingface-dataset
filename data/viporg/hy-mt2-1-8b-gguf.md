# viporg/Hy-MT2-1.8B-GGUF

## Resumen

Hy-MT2-1.8B es un modelo de traducción automática neuronal de 1.791 millones de parámetros (aproximadamente 1,8B) desarrollado por Tencent. Este repositorio concreto (`viporg/Hy-MT2-1.8B-GGUF`) no es el modelo original, sino un espejo sin modificaciones del fichero `Hy-MT2-1.8B-Q4_K_M.gguf` publicado por Tencent en `tencent/Hy-MT2-1.8B-GGUF`, distribuido como fuente de descarga alternativa para el proyecto LingoAI. La licencia declarada es Apache 2.0.

El modelo está empaquetado en formato GGUF con cuantización Q4_K_M (1.133.080.448 bytes, es decir, unos 1,1 GB), lo que lo hace apto para inferencia en CPU y en GPUs de consumo con requisitos de memoria muy reducidos. Su propósito declarado, a partir del nombre y de la referencia a LingoAI en la model card, es la traducción automática multilingüe, aunque la información pública disponible en este repositorio es muy limitada.

La relevancia actual de este modelo radica en su tamaño compacto y su licencia permisiva (Apache 2.0), que permiten integrarlo en pipelines de traducción de bajo coste, aplicaciones de escritorio o despliegues en el borde sin necesidad de infraestructura de GPU de datacenter. No obstante, la ausencia de benchmarks, de especificaciones de contexto y de detalles de entrenamiento en la información disponible limita seriamente cualquier evaluación rigurosa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | 1.791.080.448 (1,8B) |
| Parámetros activos | no disponible (no se ha confirmado que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q4_K_M (único fichero publicado en este repo) |
| Idiomas soportados | no disponible (el nombre y el proyecto LingoAI sugieren orientación multilingüe, sin confirmar) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo en la documentación proporcionada. El nombre "Hy-MT2" sugiere una segunda generación de un modelo de traducción automática (MT, Machine Translation) de Tencent, pero no se confirma si emplea un transformer decoder-only, encoder-decoder, MoE o arquitectura híbrida. Tampoco se especifican el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF, DPO o fine-tuning supervisado.

La única información técnica verificable es el artefacto publicado: un fichero GGUF cuantizado en Q4_K_M con un SHA-256 documentado (`dc5f44fcf1fa496ee7ad725982c0c8c553a4de00259b53af84c4b89fb0c06699`), generado a partir del repositorio oficial de Tencent en el commit `a0c709d9fac510f2c807aa3af52872340dc37a4a`. No se documentan innovaciones técnicas como decodificación especulativa, atención lineal o mecanismos de pensamiento extendido.

## Capacidades

- Traducción automática: el nombre del modelo y su asociación con el proyecto LingoAI apuntan a la traducción entre idiomas como capacidad principal, aunque no se detallan los pares de idiomas soportados.
- Generación de texto conversacional: la etiqueta `conversational` del repositorio indica soporte para diálogo, sin especificar calidad ni idiomas.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere que el modelo puede servirse mediante APIs compatibles con el formato estándar de Hugging Face.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: presumiblemente sí, dado el propósito de traducción, pero sin lista de idiomas confirmada.
- Capacidades especiales (visión, audio, thinking mode): no disponible.

## Casos de uso

- Traducción automática en aplicaciones de escritorio: el tamaño de 1,1 GB en Q4_K_M permite empaquetar el modelo dentro de una aplicación de escritorio o móvil y ejecutar traducción local sin conexión, con latencia aceptable en CPU moderna.
- Servicio de traducción de bajo coste en el borde: desplegado con llama.cpp u Ollama en un servidor pequeño o una Raspberry Pi de gama alta, puede atender traducciones de documentos cortos sin GPU dedicada.
- Preprocesado multilingüe en pipelines de datos: útil para normalizar o traducir corpus antes de alimentar modelos mayores, aprovechando su reducido coste computacional por inferencia.
- Traducción de subtítulos y contenido audiovisual: con un contexto presumiblemente corto (no confirmado), encaja en la traducción por segmentos típica de subtitulado, donde cada unidad es una frase o un diálogo breve.
- Integración en asistentes conversacionales multilingües: la etiqueta `conversational` permite usarlo como capa de traducción en un chatbot que reciba mensajes en varios idiomas y responda en el idioma del usuario.
- Fallback de traducción en sistemas con restricciones de memoria: su huella de 1,1 GB lo convierte en candidato para entornos donde un modelo de 7B o superior no cabe, como contenedores con límites estrictos de RAM.
- Investigación en traducción de bajo recursos: sirve como línea base ligera para comparar técnicas de cuantización o fine-tuning en tareas de MT sin requerir hardware de datacenter.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,2-1,5 GB para el fichero Q4_K_M, incluyendo overhead de contexto y caché KV (estimación basada en el tamaño del artefacto, no en datos oficiales).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, como GTX 1650, RTX 3050, RTX 4060 o superiores; también funciona en CPU.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo moderna e incluso en iGPUs con memoria unificada suficiente.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y servidores compatibles con GGUF; la etiqueta `endpoints_compatible` sugiere compatibilidad con APIs estándar.
- Latencia y throughput: no disponible; dependerá del hardware y de la longitud de contexto, que no se ha especificado.

## Comparativa con modelos similares

No se dispone de información suficiente sobre modelos comparables de traducción de tamaño similar (por ejemplo, NLLB-200-distilled-600M, M2M-100-418M o Helsinki-NLP opus-mt) en la documentación proporcionada para establecer una comparación rigurosa de rendimiento. A continuación se ofrece una comparación estructural limitada a los datos verificables:

| Modelo | Parámetros | Contexto | Licencia | Formato | Benchmarks MT |
|---|---|---|---|---|---|
| Hy-MT2-1.8B (este repo) | 1,8B | no disponible | Apache 2.0 | GGUF (Q4_K_M) | no disponible |
| NLLB-200-distilled-600M | 600M | 512 tokens (típico) | CC-BY-NC 4.0 | safetensors | no comparado aquí |
| M2M-100-418M | 418M | 1024 tokens (típico) | MIT | safetensors | no comparado aquí |
| Helsinki-NLP opus-mt | variable (~70-300M) | 512 tokens (típico) | CC-BY 4.0 | safetensors | no comparado aquí |

La comparación de rendimiento real no puede realizarse sin datos de benchmarks publicados para Hy-MT2-1.8B.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay métricas de calidad de traducción (BLEU, COMET, chrF) publicadas en la información disponible, lo que impide validar su rendimiento frente a alternativas.
- Especificaciones incompletas: se desconocen la longitud de contexto, la lista de idiomas soportados, la arquitectura y los datos de entrenamiento, lo que dificulta evaluar su idoneidad para producción.
- Riesgo de alucinación y errores de traducción: sin datos de evaluación, no puede descartarse que el modelo omita, añada o distorsione contenido, especialmente en dominios especializados o idiomas de bajos recursos.
- Espejo no oficial: este repositorio es una copia de un tercero (`viporg`) no afiliada a Tencent; aunque el SHA-256 está documentado, conviene verificar la integridad del fichero antes de usarlo en producción.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el usuario debe conservar el aviso de copyright de Tencent y el fichero LICENSE.txt incluido.
- Sesgos: no se documentan sesgos conocidos, pero al no conocerse la composición del dataset de entrenamiento no puede descartarse la presencia de sesgos lingüísticos o culturales.
- Cuantización única: solo se ofrece Q4_K_M en este repositorio, lo que puede degradar la calidad respecto a los pesos originales en precisión completa; no se dispone de variantes Q8_0 o FP16 en este espejo.

## Enlaces

- Repositorio del espejo: https://huggingface.co/viporg/Hy-MT2-1.8B-GGUF
- Repositorio original de Tencent: https://huggingface.co/tencent/Hy-MT2-1.8B-GGUF
- Commit de referencia del modelo base: `a0c709d9fac510f2c807aa3af52872340dc37a4a`
- Proyecto LingoAI: no disponible (mencionado en la model card sin enlace)
