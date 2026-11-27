# ykich/nogoji-proofread-gguf

## Resumen

nogoji-proofread-gguf es un modelo de corrección de texto en japonés derivado mediante fine-tuning LoRA de sbintuitions/sarashina2.2-1b-instruct-v0.1, el modelo instructivo de 1B parámetros de SB Intuitions. Lo desarrolla el autor independiente ykich como componente interno de nogoji, una aplicación de barra de menús para macOS que corrige el texto seleccionado localmente, sin enviar datos a la nube. Su función concreta es reparar errores de mecanografía: pulsaciones equivocadas, caracteres ausentes y caracteres sobrantes. La corrección de errores de conversión de kanji queda delegada a otro componente de la aplicación (zenz-v3.2-small).

El modelo no es un corrector ortográfico general ni un asistente conversacional: está ajustado para una única tarea y una única plantilla de prompt. Se distribuye exclusivamente en formato GGUF con cuantización Q8_0 (1.498.332.544 bytes, SHA-256 `985e327c735b488c71afd94a6db370e9bdec1c850ed46db89ff99bd78785fa20`), pensado para ejecutarse en CPU o GPU integrada de un Mac doméstico. El repositorio ocupa 1,5 GB y contiene un solo archivo de pesos.

Su relevancia práctica es acotada pero clara: demuestra un flujo completo de especialización de un modelo japonés de 1B parámetros con datos sintéticos generados localmente, cuantización vía llama.cpp y despliegue en una aplicación de escritorio con verificación de integridad por hash. Para desarrolladores que necesiten corrección de erratas japonesas en local con licencia MIT, es un punto de partida reproducible; para cualquier otro uso, el propio autor advierte que no está ajustado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de sarashina2.2-1b-instruct-v0.1; detalles internos no disponibles) |
| Parametros totales | 1.407.538.944 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (única publicada) |
| Idiomas soportados | Japonés (ja) |
| Licencia | MIT (Copyright (c) 2026 ykich); modelo base MIT (Copyright (c) 2025 SB Intuitions) |
| Formato de pesos | GGUF (`nogoji-proofread-v1-Q8_0.gguf`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base sarashina2.2-1b-instruct-v0.1 de SB Intuitions, un transformer decoder-only de 1B parámetros orientado a japonés. Sobre él se aplicó un fine-tuning LoRA (adaptadores de bajo rango) que después se fusionó en los pesos del modelo base y se convirtió a GGUF Q8_0 con llama.cpp. No se especifican en la información disponible la dimensión oculta, el número de capas, el número de cabezas de atención ni la longitud de contexto del modelo original.

El dataset de entrenamiento se generó de forma sintética y local: aproximadamente 10.000 frases en japonés producidas con Qwen3.5-4B (Apache-2.0) en un Mac, a las que se inyectaron mecánicamente errores de mecanografía propios de la entrada en romaji y en kana. El par (frase con errores, frase original) constituye el corpus de entrenamiento del LoRA. El dataset no está publicado. No se documenta el uso de RLHF, DPO ni ninguna otra etapa de alineación posterior, ni el número de tokens de entrenamiento. La innovación técnica destacable no está en la arquitectura, sino en el pipeline: generación de datos sintéticos en local, fine-tuning LoRA, fusión, cuantización Q8_0 y distribución con verificación SHA-256 en el cliente.

## Capacidades

- Corrección de errores de mecanografía en japonés: pulsaciones equivocadas, omisiones de caracteres y caracteres sobrantes.
- Preservación estricta del resto del texto: el prompt de sistema exige no modificar ningún otro carácter y devolver la entrada intacta si no hay errores.
- Salida restringida al texto corregido, sin explicaciones ni metatexto, cuando se usa la plantilla exacta de entrenamiento.
- Formato conversacional compatible con la plantilla de chat de Sarashina: `<|system|>{instrucción}</s><|user|>{texto}</s><|assistant|>`, sin token BOS inicial.
- No cubre corrección de errores de conversión de kanji: esa función corresponde a zenz-v3.2-small dentro de la aplicación nogoji.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo de pensamiento.
- Multilingüismo: solo japonés declarado; no hay evidencia de comportamiento fiable en otros idiomas.

## Casos de uso

- Corrección de erratas en la aplicación nogoji: es el caso de uso previsto y el único para el que el autor garantiza un comportamiento ajustado. El modelo recibe el texto seleccionado en macOS y devuelve la versión corregida localmente, sin salida a red.
- Preprocesado de texto japonés antes de indexación o búsqueda: normalizar erratas de mecanografía en corpus introducidos manualmente (formularios, notas, transcripciones tecleadas) antes de alimentar un motor de búsqueda o un pipeline de NLP, siempre con revisión humana posterior.
- Limpieza de entradas en herramientas internas de anotación: reducir el ruido de tecleo en textos japoneses recogidos por anotadores antes de pasarlos a un modelo mayor o a un proceso de etiquetado.
- Filtro previo en sistemas de corrección en dos etapas: usar este modelo para erratas de mecanografía y encadenar un corrector de conversión de kanji (por ejemplo, zenz-v3.2-small) para los errores restantes, replicando la arquitectura de nogoji.
- Prototipado de asistentes de escritura offline en japonés: servir de componente de bajo coste en una app de escritorio o extensión que requiera corrección local sin GPU dedicada, aprovechando la cuantización Q8_0 y el tamaño de 1,5 GB.
- Evaluación de pipelines de datos sintéticos: como referencia reproducible de un flujo generación sintética con un LLM, inyección de errores, LoRA y cuantización, útil para equipos que quieran construir correctores especializados en otros dominios o idiomas.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse en local y con licencia MIT, encaja en flujos donde el texto no puede salir del dispositivo, como documentación interna o borradores personales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo Q8_0 ocupa 1.498.332.544 bytes (aproximadamente 1,4 GiB); con overhead de contexto y runtime de llama.cpp, el consumo esperado ronda 1,6-2,0 GiB, aunque no se documenta una cifra oficial.
- GPU recomendadas: no se especifican. Por tamaño, cualquier GPU con al menos 2-3 GB de memoria libre es suficiente; también es viable en CPU.
- GPU de consumo: cabe con holgura en tarjetas de 4 GB o más (GTX 1650, RTX 3050, RTX 4060, etc.) y en Apple Silicon con memoria unificada. El caso de uso original es un Mac de escritorio.
- Opciones de despliegue: llama.cpp y cualquier runtime compatible con GGUF (Ollama, LM Studio, servidores basados en llama.cpp). El repositorio está etiquetado como `endpoints_compatible`. No se documenta soporte de vLLM ni TGI para este artefacto.
- Latencia y throughput: no disponibles. Al ser un modelo de 1B parámetros en Q8_0, la latencia por frase corta debería ser de décimas de segundo en hardware de consumo, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| nogoji-proofread-gguf | 1,41 B | no disponible | Corrección de erratas de tecleo en japonés | MIT | GGUF Q8_0 | Ajustado a una única plantilla de prompt; no publica benchmarks |
| sbintuitions/sarashina2.2-1b-instruct-v0.1 | 1,41 B (aprox., mismo base) | no disponible | Instrucciones generales en japonés | MIT | safetensors (formato original) | Modelo base; capacidades generales, sin especialización en erratas |
| zenz-v3.2-small | no disponible | no disponible | Corrección de conversión de kanji en japonés | no disponible | no disponible | Componente complementario citado por el autor; cubre una función distinta |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo pequeño de aproximadamente 1.000 millones de parámetros: puede reescribir incorrectamente texto que ya era correcto y puede pasar por alto errores reales.
- El autor exige revisión humana de la salida antes de usarla; no es apto para corrección automática sin supervisión.
- Está ajustado a una única instrucción de sistema y a la plantilla de chat de Sarashina. Usar otro prompt o formato produce comportamientos fuera de lo previsto.
- No corrige errores de conversión de kanji; esos casos quedan fuera de su alcance por diseño.
- Solo japonés declarado; no hay evidencia de calidad en otros idiomas.
- No se documentan sesgos concretos, pero al derivar de un modelo japonés de propósito general y entrenarse con datos sintéticos generados por otro LLM, puede heredar sesgos de ambos y artefactos del generador de datos.
- Riesgo de alucinación: aunque la tarea es de reescritura conservadora, un modelo de este tamaño puede introducir cambios no solicitados en el texto.
- Licencia MIT permite uso comercial y modificación, con la obligación de incluir los avisos de copyright de ykich (2026) y de SB Intuitions (2025).
- El dataset de entrenamiento no es público, lo que limita la auditoría y la reproducibilidad del ajuste.
- La distribución oficial está pensada para descarga desde la aplicación nogoji con verificación SHA-256; si se sirve el archivo por otros medios, conviene replicar esa comprobación de integridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ykich/nogoji-proofread-gguf
- Modelo base: https://huggingface.co/sbintuitions/sarashina2.2-1b-instruct-v0.1
- llama.cpp (herramienta de conversión a GGUF): https://github.com/ggml-org/llama.cpp
- zenz-v3.2-small (componente complementario citado por el autor): no disponible enlace directo en la información proporcionada
