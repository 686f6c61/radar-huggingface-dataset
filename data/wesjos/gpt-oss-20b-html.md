# wesjos/gpt-oss-20b-HTML

## Resumen

`wesjos/gpt-oss-20b-HTML` es un ajuste fino (fine-tuning) del modelo `unsloth/gpt-oss-20b-unsloth-bnb-4bit`, que a su vez deriva del modelo abierto GPT-OSS 20B de OpenAI. Lo publica el usuario wesjos en Hugging Face bajo licencia Apache 2.0. El nombre sugiere una especializacion en generacion o tratamiento de HTML, aunque la model card no documenta explicitamente el dataset ni el objetivo concreto del ajuste.

El modelo conserva la arquitectura y el tamano del GPT-OSS 20B original (20.914.757.184 parametros segun los pesos en safetensors), pero se ha entrenado con la libreria Unsloth y TRL de Hugging Face, lo que el autor destaca como un entrenamiento "2x mas rapido". El repositorio ocupa 82,5 GB, un tamano desproporcionado para 20B parametros, lo que indica que probablemente contiene pesos en varios formatos o precisiones (incluyendo la base cuantizada en 4 bits de la que parte).

Es relevante como ejemplo de fine-tuning comunitario sobre la familia GPT-OSS, pero conviene tratarlo con cautela: la documentacion es minima, no hay benchmarks publicados, el idioma declarado es unicamente ingles y el numero de descargas es bajo (112). No debe confundirse con el GPT-OSS 20B oficial de OpenAI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia GPT-OSS; detalles de capas y atencion no disponibles en la informacion proporcionada) |
| Parametros totales | 20.914.757.184 (~20,9 B) |
| Parametros activos | no disponible (no se indica que sea MoE en la informacion proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | el modelo base es una version bnb-4bit; el repo incluye safetensors; no se detallan otras cuantizaciones |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers); tamano del repo 82,5 GB |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del checkpoint `unsloth/gpt-oss-20b-unsloth-bnb-4bit`, que es una version cuantizada en 4 bits (bitsandbytes) del GPT-OSS 20B. El entrenamiento se realizo con Unsloth y la libreria TRL de Hugging Face, segun indica el autor. No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o SFT. Tampoco se detalla si se uso LoRA/QLoRA o un ajuste completo.

No hay informacion sobre innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, modos de razonamiento explicitos, etc.) mas alla de las que herede del GPT-OSS 20B original. La model card es practicamente generica y se limita a indicar el modelo base, la licencia y las herramientas usadas.

## Capacidades

- Generacion de texto conversacional, heredada del GPT-OSS 20B base.
- Especializacion probable en HTML (por el sufijo del nombre), aunque no documentada explicitamente.
- Soporte de tool calling / function calling: no confirmado en la informacion disponible para este ajuste concreto.
- Capacidades de agente y razonamiento multi-paso: no confirmadas para este ajuste.
- Capacidades multilingues: limitadas al ingles segun la etiqueta `language: en`.
- Modo "thinking" o razonamiento explicito: no confirmado en la informacion disponible.

## Casos de uso

- Generacion y maquetacion de HTML: el nombre del modelo sugiere que puede emplearse para producir fragmentos de HTML, plantillas o estructuras de pagina a partir de descripciones en lenguaje natural, aprovechando el ajuste especifico.
- Prototipado de interfaces web: generar esqueletos de paginas o componentes HTML para iterar rapidamente en diseno front-end antes de la revision humana.
- Conversion de texto a marcado: transformar contenido en bruto en HTML estructurado (listas, tablas, secciones) en pipelines de publicacion de contenido.
- Asistencia en documentacion tecnica: generar ejemplos de codigo HTML embebidos en articulos o manuales, siempre con revision posterior.
- Pruebas de extraccion y limpieza de HTML: usar el modelo para tareas de transformacion o normalizacion de fragmentos de marcado en entornos controlados.
- Experimentacion e investigacion: servir como punto de partida para fine-tunings adicionales sobre GPT-OSS 20B, dado que parte de una base cuantizada en 4 bits y usa Unsloth.
- Chat conversacional en ingles: uso general como modelo de texto en ingles, aunque sin garantias documentadas de calidad frente al base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: con 20,9 B parametros, en fp16 requiere aproximadamente 42 GB de VRAM; en 8 bits unos 21 GB; en 4 bits (como la base bnb-4bit) alrededor de 11-12 GB, mas overhead de contexto y activaciones.
- GPU recomendadas: A100 40/80 GB, H100 80 GB para fp16; L40S, RTX 6000 Ada o A6000 para cuantizaciones intermedias.
- GPU de consumo: en 4 bits puede caber en RTX 4090 (24 GB) o RTX 3090 (24 GB); en 8 bits es ajustado en 24 GB; en fp16 no cabe en GPU de consumo.
- Opciones de despliegue: transformers (formato nativo del repo), text-generation-inference (etiqueta `text-generation-inference`), y potencialmente vLLM o llama.cpp si se convierten los pesos a los formatos correspondientes (no confirmado en la informacion disponible).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| wesjos/gpt-oss-20b-HTML | ~20,9 B | no disponible | Apache 2.0 | Hugging Face (112 descargas) | Fine-tuning comunitario, documentacion minima |
| GPT-OSS 20B (OpenAI) | ~20 B | no disponible en esta ficha | no disponible en esta ficha | Hugging Face / repos oficiales | Modelo base original, con documentacion oficial |
| unsloth/gpt-oss-20b-unsloth-bnb-4bit | ~20,9 B | no disponible en esta ficha | Apache 2.0 | Hugging Face | Version cuantizada en 4 bits usada como base de este ajuste |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- Documentacion practicamente inexistente: no se describe el dataset, el objetivo del ajuste ni la metodologia de evaluacion.
- Solo declarado para ingles; el rendimiento en castellano no esta garantizado ni evaluado.
- Riesgo de alucinacion inherente a los modelos de lenguaje; sin benchmarks no hay evidencia de mitigacion.
- Posibles sesgos heredados del GPT-OSS 20B original y del dataset de ajuste (no documentado).
- Longitud de contexto no especificada: no se puede planificar su uso en tareas de contexto largo sin verificacion previa.
- Tamano del repo (82,5 GB) muy superior al esperado para 20B en un solo formato: conviene revisar que archivos se descargan para evitar consumo innecesario de disco y ancho de banda.
- Uso comercial permitido por Apache 2.0, pero el autor no ofrece garantias de calidad ni soporte.
- Bajo numero de descargas y ausencia de likes: comunidad reducida, sin validacion externa.
- No debe presentarse como el GPT-OSS 20B oficial de OpenAI; es un derivado comunitario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wesjos/gpt-oss-20b-HTML
- Modelo base (cuantizado): https://huggingface.co/unsloth/gpt-oss-20b-unsloth-bnb-4bit
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Libreria TRL de Hugging Face: https://github.com/huggingface/trl
