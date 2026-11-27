# yoomaismart/whisper-small-ko-meeting

## Resumen

whisper-small-ko-meeting es un ajuste fino (fine-tuning) del modelo de reconocimiento automatico del habla openai/whisper-small, publicado por el usuario yoomaismart en Hugging Face. El modelo esta especializado en transcripcion de audio en coreano (codigo de idioma `ko`), y su nombre sugiere un enfasis en audio de reuniones, aunque la model card no documenta explicitamente esa especializacion. Se distribuye bajo licencia Apache 2.0 y con pesos en formato safetensors, lo que facilita su integracion en pipelines basados en la libreria transformers.

Tecnicamente se trata de un transformer encoder-decoder de tipo Whisper con 241.734.912 parametros, derivado de la variante "small" de OpenAI. El ajuste se realizo sobre el dataset Bingsu/zeroth-korean, un corpus de habla coreana disponible publicamente, durante 1000 pasos de entrenamiento con un learning rate de 1e-05 y precision mixta nativa AMP. El autor reporta una perdida de validacion de 0,1736 y un CER (Character Error Rate) de 8,8078 sobre el conjunto de evaluacion.

Su relevancia es acotada pero concreta: cubre la necesidad de transcripcion automatica en coreano con un modelo de tamano reducido (aproximadamente 1 GB de repositorio), desplegable en hardware modesto y con licencia permisiva para uso comercial. No obstante, la documentacion es muy escasa, el modelo no tiene descargas ni likes en el momento de la consulta y los resultados declarados muestran un empeoramiento del CER entre la primera y la segunda epoca, lo que invita a validar su calidad antes de usarlo en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parametros totales | 241.734.912 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (Whisper-small trabaja con ventanas de audio de 30 segundos; el autor no documenta el contexto) |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos safetensors en el repo) |
| Idiomas soportados | coreano (`ko`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Whisper de OpenAI en su variante small: un transformer encoder-decoder disenado para reconocimiento automatico del habla, que procesa espectrogramas mel de audio y genera tokens de transcripcion. El ajuste fino parte de los pesos de openai/whisper-small y se entrena sobre el dataset Bingsu/zeroth-korean, segun indica la model card. No se documenta el numero total de tokens de audio ni la composicion detallada del dataset mas alla de su nombre.

Los hiperparametros declarados son: learning rate de 1e-05, batch de entrenamiento y evaluacion de 16, semilla 42, optimizador AdamW con betas (0,9; 0,999) y epsilon 1e-08, scheduler lineal con 100 pasos de warmup, 1000 pasos totales de entrenamiento y precision mixta nativa AMP. El entrenamiento se realizo con Transformers 4.57.6, PyTorch 2.14.1+cu130, Datasets 3.6.0 y Tokenizers 0.22.2. No se menciona el uso de RLHF, DPO ni tecnicas de decodificacion especulativa.

## Capacidades

- Reconocimiento automatico del habla (ASR) en coreano, con salida de texto a partir de audio.
- Transcripcion de audio de hasta 30 segundos por ventana, segun el diseno de Whisper-small (el autor no documenta variaciones).
- Especializacion declarada en audio de reuniones por el nombre del modelo, aunque no se detalla en la model card.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingue mas alla del coreano.
- No se documentan modos especiales como thinking mode, vision o audio adicional.

## Casos de uso

- Transcripcion de reuniones de equipo en coreano: el modelo puede convertir grabaciones de reuniones en texto para actas y resumenes posteriores, aprovechando su ajuste sobre habla coreana y su tamano reducido para procesar lotes en servidores modestos.
- Generacion de subtitulos para contenido audiovisual en coreano: integrado en un pipeline de ASR, permite producir subtitulos automaticos para videos, cursos o webinars en coreano con un coste de inferencia bajo.
- Indexacion y busqueda de audio corporativo: transcribir archivos de audio de una organizacion para hacerlos buscables por texto, usando el modelo como primer paso de un sistema de recuperacion de informacion.
- Analisis de llamadas de atencion al cliente: convertir conversaciones telefonicas en coreano a texto para analisis de sentimiento, deteccion de incidencias o control de calidad, con la ventaja de la licencia Apache 2.0 para uso comercial.
- Accesibilidad: generar transcripciones en tiempo casi real para personas con discapacidad auditiva en entornos coreanohablantes, desplegando el modelo en infraestructura local.
- Prototipado rapido de aplicaciones de voz en coreano: al ser un modelo pequeno (aproximadamente 1 GB), permite experimentar en estaciones de trabajo con una sola GPU consumer antes de escalar a modelos mayores.
- Preprocesado de datasets de voz: usar el modelo para transcribir y etiquetar audio coreano de forma automatica en proyectos de investigacion o construccion de corpus.

## Benchmarks y rendimiento

El autor declara los siguientes resultados sobre el conjunto de evaluacion (datos de la model card, no verificados de forma independiente):

| Metrica | Epoca 1 (paso 500) | Epoca 2 (paso 1000) |
|---|---|---|
| Training loss | 0,1768 | 0,0735 |
| Validation loss | 0,1991 | 0,1736 |
| CER | 6,1461 | 8,8078 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El model-index oficial no contiene resultados.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp32): aproximadamente 1 GB para los pesos (241,7 M de parametros), mas memoria para activaciones y buffers de audio; en la practica, entre 2 y 3 GB.
- En fp16/bf16: aproximadamente 0,5 GB de pesos, con un consumo total estimado de 1 a 2 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; una RTX 3060, RTX 4060 o superior es suficiente. Para lotes grandes, A100 o H100 no son necesarias pero permiten mayor throughput.
- Cabe en GPU consumer: si, practicamente en cualquier GPU moderna con 4 GB o mas de VRAM.
- Opciones de despliegue: transformers (pipeline de automatic-speech-recognition), vLLM no aplica de forma estandar para Whisper, llama.cpp no soporta Whisper de forma nativa, TGI no es la via habitual; se puede usar transformers con PyTorch, ONNX Runtime o faster-whisper para optimizacion.
- Latencia y throughput estimados: no disponibles; el autor no publica mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| whisper-small-ko-meeting | 241,7 M | no disponible (ventanas de 30 s en Whisper-small) | coreano | Apache 2.0 | Hugging Face, 0 descargas |
| openai/whisper-small | 241,7 M | ventanas de 30 s | multilingue (99 idiomas) | Apache 2.0 | Hugging Face, ampliamente usado |
| openai/whisper-base | 74 M | ventanas de 30 s | multilingue | Apache 2.0 | Hugging Face |
| openai/whisper-medium | 769 M | ventanas de 30 s | multilingue | Apache 2.0 | Hugging Face |

La comparativa se limita a la familia Whisper porque no se dispone de informacion sobre otros ajustes coreanos comparables en la documentacion proporcionada. Frente a openai/whisper-small, este modelo ofrece especializacion en coreano a costa de perder cobertura multilingue; frente a whisper-medium, es mas ligero pero con menor capacidad nominal.

## Limitaciones y advertencias

- Documentacion muy escasa: la model card contiene secciones "More information needed" en descripcion, usos previstos y datos de entrenamiento, lo que dificulta evaluar su calidad real.
- El CER empeora entre la epoca 1 (6,1461) y la epoca 2 (8,8078), lo que sugiere posible sobreajuste o inestabilidad en el entrenamiento; conviene validar con datos propios.
- El modelo solo declara soporte de coreano; no se garantiza un comportamiento correcto en otros idiomas.
- Riesgo de alucinacion en audio con ruido, musica o habla solapada, comun en modelos Whisper; no se documentan mitigaciones.
- No se documentan sesgos especificos, pero al entrenarse sobre un unico corpus (Bingsu/zeroth-korean) puede heredar los sesgos de dominio y registro de ese dataset.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte.
- Sin descargas ni likes en el momento de la consulta: no hay evidencia de uso en produccion ni validacion por la comunidad.
- No se documentan limitaciones de contexto mas alla del diseno estandar de Whisper (ventanas de 30 segundos), lo que puede afectar a reuniones largas si no se segmenta el audio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yoomaismart/whisper-small-ko-meeting
- Modelo base: https://huggingface.co/openai/whisper-small
- Dataset de entrenamiento: https://huggingface.co/datasets/Bingsu/zeroth-korean
- Repositorio de Transformers: https://github.com/huggingface/transformers
- No se han encontrado papers, blogs, repositorios o demos adicionales en la informacion disponible.
