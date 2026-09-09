# xelsoft-ai-lab/AfriVoxAccent_QW3_spk_acc_12hz_lora-r32_s42_20260909_130100

## Resumen

El modelo `AfriVoxAccent_QW3_spk_acc_12hz_lora-r32_s42_20260909_130100` es un adaptador LoRA de rango 32 (r32) desarrollado por `xelsoft-ai-lab` sobre el modelo base `Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice`. Su propósito es adaptar el sistema de síntesis de voz de Qwen3 a la lengua wolof, con un enfoque multi-acento y orientado al canal de instrucciones `customvoice` del modelo base.

El adaptador se distribuye en formato PEFT, en `safetensors`, con un tamaño de repositorio de 0,2 GB. Al tratarse de un adaptador LoRA, no contiene los pesos completos del modelo base, sino los deltas de entrenamiento que se aplican sobre los pesos de `Qwen3-TTS-12Hz-1.7B`, que cuenta con aproximadamente 1.700 millones de parámetros. El modelo está pensado para tareas de text-to-speech en wolof y forma parte de la serie `AfriVoxAccent`, destinada a mejorar la representación de acentos africanos en sistemas TTS.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre `Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice` |
| Parametros totales | No disponible (el adaptador es de rango 32; el modelo base tiene 1,7B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Wolof (segun los tags del repositorio) |
| Licencia | No disponible |
| Formato de pesos | Safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se apoya en la arquitectura de `Qwen3-TTS-12Hz-1.7B-CustomVoice`, un modelo de text-to-speech basado en transformer que genera audio a 12 Hz de resolución y que admite instrucciones de voz personalizadas (`customvoice`). El componente adicional es un adaptador LoRA de rango 32, una técnica de fine-tuning eficiente que solo entrena matrices de bajo rango, lo que reduce el coste computacional y el espacio de almacenamiento frente a un ajuste completo.

Según la model card, el adaptador está orientado al canal instruct `customvoice`, lo que sugiere que ha sido entrenado para seguir indicaciones relativas al estilo, tono o acento del hablante. Los datos de entrenamiento no se detallan, pero los tags indican una especialización en wolof y en variaciones de acento (`spk_acc`). No se ha publicado información sobre el uso de RLHF, DPO u otros métodos de alineación.

## Capacidades

- Sintesis de voz en wolof mediante un adaptador LoRA sobre `Qwen3-TTS`.
- Soporte de multi-acento dentro del wolof, según los tags `spk_acc` y `afrivoxaccent`.
- Integración con el canal `customvoice` del modelo base, lo que permite controlar características de la voz mediante instrucciones.
- No se mencionan capacidades de tool calling, agentes, vision ni otros dominios distintos de TTS.
- No hay información disponible sobre capacidades multilingües más allá del wolof.

## Casos de uso

- Accesibilidad para hablantes de wolof: el modelo puede generar audio hablado en wolof a partir de texto, algo útil en lectores de pantalla o aplicaciones de accesibilidad.
- Educacion y divulgacion: creacion de material didactico en wolof, como cuentos o lecciones narradas, con voces sinteticas adaptadas a acentos locales.
- Doblaje de contenido multimedia: adaptacion de guiones o subtitulos a voz en wolof para videos cortos, anuncios o productos culturales.
- Asistentes de voz en wolof: el adaptador permite ampliar asistentes de voz existentes, aunque para un uso real seria necesario integrarlo en un pipeline de TTS completo.
- Investigacion en TTS para lenguas africanas: proporciona una base de partida para experimentar con adaptacion a otros dialetos o acentos del wolof.
- Prototipado de servicios de lectura en wolof: el modelo puede usarse en aplicaciones de lectura de noticias o documentos para hablantes de wolof.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El modelo base es de 1,7B parametros, por lo que la VRAM necesaria para cargarlo en precision fp16 con el adaptador LoRA se estima en torno a 4-6 GB, dependiendo del framework y la resolucion de audio.
- GPU recomendadas: una RTX 3060 de 12 GB o superior; en precisiones inferiores o cuantizaciones, podria ejecutarse en GPU con 8 GB.
- No se indican opciones de despliegue oficiales. Dado que el adaptador usa PEFT, la via natural es Transformers con el modelo base y el adaptador cargados conjuntamente.
- No se han publicado datos de latencia ni throughput.

## Comparativa con modelos similares

No disponible. No se han encontrado referencias a modelos comparables dentro de la informacion proporcionada.

## Limitaciones y advertencias

- La licencia no esta disponible, lo que introduce incertidumbre juridica sobre el uso comercial o la redistribucion del adaptador.
- No existen benchmarks ni evaluaciones publicadas que validen la calidad de la sintesis en wolof.
- El modelo no es autonomo: requiere el modelo base `Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice`, que a su vez tiene sus propias condiciones y requisitos.
- La ausencia de datos sobre sesgos, alucinaciones o errores en la generacion de audio impide valorar su comportamiento en produccion.
- El repositorio tiene 0 descargas y 0 likes, lo que indica que no ha sido validado por la comunidad hasta la fecha de la ficha.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/xelsoft-ai-lab/AfriVoxAccent_QW3_spk_acc_12hz_lora-r32_s42_20260909_130100
- Modelo base: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice
