# XeyonAI/Helcyon-Aurora-12b-v1.0-GGUF

## Resumen

Helcyon Aurora 12B v1.0 es un modelo de lenguaje afinado (fine-tune) por XeyonAI (también conocido como HardWire) sobre una base Gemma 4 12B de Google. Está diseñado específicamente como compañero conversacional local: conversación natural, roleplay, escritura creativa breve y asistencia práctica del día a día. Con 11.907.350.576 parámetros (~11,9 mil millones) y distribución en formato GGUF, está pensado para inferencia local en hardware de consumo mediante runtimes compatibles con Gemma 4.

El modelo se entrena principalmente con datasets generados por "GPT-6 Astra", según el autor, con el objetivo de trasladar calidez, personalidad y estilo conversacional a un modelo ejecutable en local. A esto se suman datasets propios de Helcyon descritos como "anti-corporate, anti-ideology y pro-free expression", orientados a evitar respuestas excesivamente cautas o guionizadas. Es relevante en el ecosistema de modelos locales para rol y compañía porque combina una base moderna (Gemma 4) con un ajuste de personalidad explícito y soporte multimodal vía mmproj.

La versión publicada es la v1.0; el propio autor remite a una v1.1 actualizada en otro repositorio. La model card reconoce una debilidad conocida en escritura creativa de formato largo (pérdida de coherencia narrativa, diálogos repetitivos o deriva argumental), por lo que el foco real del modelo es la conversación y el seguimiento de instrucciones, no la generación de ficción extensa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Gemma 4 12B, fine-tune) |
| Parametros totales | 11.907.350.576 (~11,9 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el autor recomienda usar la longitud de contexto suministrada junto a los ficheros) |
| Tipos de cuantizacion | GGUF (el repo incluye cuantizaciones; no se detalla la lista exacta de niveles en la informacion disponible) |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible (la model card incluye una nota interna pidiendo verificar los términos de licencia upstream y derivada antes de publicar) |
| Formato de pesos | GGUF (repo de 69,1 GB; incluye mmproj para visión) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Gemma 4 12B, un transformer decoder-only de aproximadamente 11,9 mil millones de parámetros. XeyonAI no publica detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni la configuración de hiperparámetros. Lo que sí se indica es que el fine-tune combina la base Gemma 4 con datasets generados por "GPT-6 Astra" (para estilo conversacional y personalidad) y datasets propios de Helcyon orientados a comportamiento, roleplay y expresión libre.

El autor menciona que los primeros intentos de ajuste sobre Gemma 4 toparon con dificultades relacionadas con el entrenamiento de alineamiento del modelo base, y que tras experimentación lograron "atravesar" esas dificultades. No se especifica si se empleó RLHF, DPO, SFT puro u otra combinación, ni se documentan innovaciones técnicas como decodificación especulativa o atención lineal. El modelo se distribuye en GGUF e incluye un fichero mmproj, lo que habilita entrada de imágenes en runtimes compatibles, aunque la model card no detalla la arquitectura del adaptador de visión.

## Capacidades

- Generación de texto conversacional multi-turno con personalidad definida (cálida, curiosa, ocasionalmente irreverente).
- Roleplay y adopción de personaje mediante tarjeta de personaje (character card) y plantilla de chat nativa.
- Seguimiento de instrucciones y asistencia práctica: brainstorming, redacción breve, organización y resolución de problemas cotidianos.
- Capacidad multimodal de visión mediante el fichero mmproj incluido (entrada de imágenes en runtimes compatibles).
- Juicio conversacional: capacidad de alternar entre respuestas detalladas y respuestas breves según el contexto.
- Soporte de tool calling / function calling: no disponible (no se menciona en la información proporcionada).
- Soporte de agentes y razonamiento multi-paso: no disponible (no se menciona explícitamente).
- Capacidades multilingües: limitadas al inglés según los metadatos del modelo.
- Modo "thinking" explícito: no disponible.

## Casos de uso

- Compañero conversacional local: el modelo está entrenado específicamente para mantener conversaciones prolongadas con personalidad consistente, lo que lo hace adecuado para asistentes personales o de compañía ejecutados en hardware propio sin dependencia de la nube.
- Roleplay y ficción interactiva: con la plantilla de chat nativa y una character card, puede sostener escenas de rol multi-turno; conviene limitar la longitud de las escenas por la debilidad declarada en narrativa larga.
- Asistente de escritura breve: generación de correos, mensajes, resúmenes y borradores cortos, donde el modelo rinde mejor que en ficción extensa.
- Brainstorming y lluvia de ideas: su ajuste orientado a "expresión libre" y a evitar respuestas guionizadas favorece la generación de propuestas variadas en sesiones creativas.
- Organización personal y planificación: apoyo en listas de tareas, estructuración de notas y resolución de problemas cotidianos mediante conversación.
- Experimentación e investigación en fine-tuning: al ser un fine-tune de personalidad sobre Gemma 4 distribuido en GGUF, sirve como caso de estudio para quienes investigan alineamiento, roleplay y comportamiento conversacional en modelos locales.
- Prototipado de interfaces de chat con visión: gracias al mmproj, puede integrarse en aplicaciones que requieran describir o comentar imágenes en una conversación, siempre que el runtime lo soporte.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: depende de la cuantización elegida. Para un modelo de ~11,9 B, las cuantizaciones de 4 bits suelen requerir del orden de 7-9 GB, las de 5-6 bits en torno a 9-12 GB y las de 8 bits alrededor de 13-15 GB, sin contar KV cache ni el adaptador de visión. El autor no publica cifras concretas; recomienda escoger la cuantización según la RAM/VRAM disponible.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, cabría esperar que funcione en GPUs de consumo con 12-16 GB o más, pero no hay confirmación del autor.
- ¿Cabe en GPU de consumo? Probable en cuantizaciones bajas (4-5 bits) en tarjetas de 8-12 GB, sujeto a la longitud de contexto y al offloading; no verificado por el autor.
- Opciones de despliegue: runtimes GGUF compatibles con Gemma 4 (llama.cpp y derivados). El autor menciona explícitamente Helcyon-WebUI (HWUI) como entorno de desarrollo y prueba, y advierte de no usar plantillas de chat ni presets de sampler de otros modelos.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Helcyon Aurora 12B v1.0 | ~11,9 B | no disponible | Compañero conversacional / roleplay | no disponible | GGUF en Hugging Face |
| Helcyon Aurora 12B v1.1 | no disponible | no disponible | Versión actualizada del mismo modelo | no disponible | GGUF en Hugging Face |
| Gemma 4 12B (base) | ~12 B | no disponible | Modelo generalista de Google | no disponible en esta ficha | Pesos oficiales de Google |
| Alternativas de rol de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones verificadas de modelos comparables en la información proporcionada, por lo que la comparación cuantitativa de rendimiento no es posible.

## Limitaciones y advertencias

- Escritura creativa de formato largo: debilidad reconocida por el autor; las historias pueden perder coherencia narrativa, producir diálogos repetitivos o fragmentados, o desviarse del argumento original.
- Idiomas: el modelo está etiquetado únicamente para inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Licencia: no disponible. La model card incluye una nota interna del autor pidiendo verificar los términos de licencia upstream (Gemma) y derivada antes de publicar, lo que indica que la licencia no estaba resuelta en el momento de la publicación. Antes de un uso comercial es imprescindible confirmar la licencia aplicable.
- Alucinaciones: como cualquier modelo local, puede generar información incorrecta; el autor recomienda verificar datos en decisiones de alto riesgo.
- Sesgos: el ajuste declarado como "anti-corporate, anti-ideology y pro-free expression" puede producir respuestas con una orientación editorial concreta y menor cautela en temas sensibles; conviene evaluarlo en el dominio de despliegue.
- Contexto: la longitud de contexto no está publicada; el autor recomienda ceñirse a la configuración suministrada con los ficheros.
- Compatibilidad: requiere runtimes actualizados compatibles con Gemma 4 y su plantilla de chat nativa; usar plantillas o presets de otros modelos puede degradar el comportamiento.
- Versión: la v1.0 queda superada por una v1.1 publicada en otro repositorio; para nuevos despliegues conviene evaluar la versión más reciente.
- Metadatos incompletos: no se documenta el checkpoint upstream exacto de Gemma 4 ni los detalles de cuantización.

## Enlaces

- Hugging Face (v1.0): https://huggingface.co/XeyonAI/Helcyon-Aurora-12b-v1.0-GGUF
- Hugging Face (v1.1): https://huggingface.co/XeyonAI/Helcyon-Aurora-12b-v1.1-GGUF
- Helcyon-WebUI Free (GitHub): https://github.com/XeyonAI/Helcyon-WebUI
- Helcyon-WebUI Pro (Gumroad): https://xeyonai.gumroad.com/l/bsmupk
