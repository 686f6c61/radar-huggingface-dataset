# yjjj1/qwen3-0.6b-balanced-sft

## Resumen

Qwen3-0.6B Balanced SFT es un ajuste fino completo (full fine-tuning) del modelo Qwen3-0.6B de Alibaba, desarrollado por el usuario yjjj1 como proyecto de curso para la asignatura NTU AI6130. El objetivo no es mejorar las capacidades generales del modelo base, sino corregir un comportamiento concreto: la sicofancia, es decir, la tendencia del modelo a abandonar una respuesta correcta cuando el usuario la cuestiona con una respuesta incorrecta. El modelo entrenado aprende a mantener su respuesta cuando el feedback del usuario es erroneo y a cambiarla cuando el feedback es correcto.

El modelo conserva la arquitectura original de Qwen3-0.6B, un transformer denso de aproximadamente 596 millones de parametros, y se distribuye bajo licencia Apache 2.0. El ajuste se realiza exclusivamente sobre el dataset ARC (AI2 Reasoning Challenge), en sus splits Easy y Challenge, transformado en dialogos multi-turno de opcion multiple. Es un modelo de investigacion orientado a evaluar robustez conversacional, no un modelo de proposito general.

Su relevancia radica en que aborda de forma medible un problema de alineacion frecuente en modelos pequenos: la incapacidad de distinguir entre presion social y correccion legitima. Los resultados publicados muestran una mejora sustancial frente al modelo base en el ARC test split (80,81 % de precision global frente a 53,98 % del base), con una tasa de resistencia a feedback incorrecto del 75,38 %.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3), decoder-only |
| Parametros totales | 596.049.920 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Qwen3-0.6B) |
| Tipos de cuantizacion | no disponible (pesos almacenados en fp32; el autor sugiere cargar en bfloat16) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 2,4 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-0.6B, un transformer decoder-only denso con atencion causal estandar y sin mezcla de expertos. El ajuste fino es completo (no LoRA ni adaptadores): 3 epocas, learning rate 1e-5, batch de 16, 5 % de warmup con decaimiento coseno, sin weight decay, pesos en fp32 con autocast en bf16 y semilla 42. El entrenamiento completo tardo 1.191 segundos en una unica GPU A40, con un pico de memoria de 16,8 GB.

Los datos proceden de los splits `train` de ARC-Easy y ARC-Challenge: 3.333 preguntas convertidas en 13.332 dialogos. Cada pregunta se presenta bajo cuatro condiciones balanceadas (3.333 dialogos por condicion): respuesta correcta con feedback incorrecto (CH_WS, debe mantener), respuesta incorrecta con feedback correcto (WH_CS, debe cambiar), respuesta correcta confirmada (CH_CS, debe mantener) y respuesta incorrecta con feedback tambien incorrecto (WH_WS, debe dar la correcta). La perdida se aplica unicamente al token de la letra de respuesta (A/B/C/D). La seleccion de checkpoint se hizo por precision global en el split de validacion de ARC (860 preguntas, 3.440 dialogos), eligiendo la epoca 3. El entrenamiento se realizo siempre con `enable_thinking=False` en la plantilla de chat.

## Capacidades

- Generacion de texto y respuesta a preguntas de opcion multiple (formato A/B/C/D) sobre el dataset ARC.
- Robustez ante feedback del usuario: mantiene la respuesta correcta frente a objeciones erroneas y cambia a la correcta cuando el usuario acierta.
- Generalizacion limitada a reformulaciones del feedback: con tres frases de feedback no vistas en entrenamiento, la precision global se mantiene en 80,46 % y el Balanced Score en 75,47 %.
- Razonamiento basico de conocimiento general y cientifico de nivel escolar (contenido de ARC).
- Conversacion multi-turno (historial de dos turnos de usuario en el formato de entrenamiento).
- No soporta tool calling ni function calling de forma especifica.
- No soporta agentes ni razonamiento multi-paso mas alla del turno de respuesta.
- Capacidades multilingues limitadas al ingles.
- No dispone de vision ni audio.
- El modo thinking debe desactivarse siempre (`enable_thinking=False`); no se entreno con el activado.

## Casos de uso

- Investigacion sobre sicofancia y alineacion: permite medir de forma controlada la resistencia del modelo a la presion social en conversaciones, comparando condiciones CH_WS y WH_CS con el modelo base. Es el uso principal para el que fue disenado.
- Evaluacion de robustez conversacional en pipelines academicos: sirve como baseline reproducible (semilla 42, hiperparametros documentados) para experimentos de fine-tuning sobre Qwen3-0.6B.
- Clasificacion de respuestas de opcion multiple: dado un enunciado con cuatro opciones, se lee la respuesta como argmax sobre los logits de los tokens A/B/C/D, lo que permite integrarlo en un evaluador automatizado de examenes tipo ARC.
- Prototipado de asistentes educativos que no deben ceder ante correcciones erroneas del alumno: el modelo mantiene la respuesta correcta cuando el estudiante insiste con una opcion equivocada, util en tutoria automatizada de nivel escolar.
- Docencia y demostraciones de ajuste fino: el modelo y su receta (3 epocas, lr 1e-5, A40, 16,8 GB de pico) son reproducibles en una sola GPU para ilustrar tecnicas de SFT y evaluacion balanceada.
- Generacion de dialogos sinteticos de evaluacion: puede emplearse para producir pares pregunta-respuesta-feedback en ingles sobre temario cientifico basico, utiles para construir datasets de prueba de robustez.

## Benchmarks y rendimiento

Resultados en el split de test de ARC (3.522 preguntas, fraseo de feedback visto en entrenamiento):

| Metrica | ARC-Easy | ARC-Challenge | Global |
|---|---|---|---|
| CH_WS (resiste feedback erroneo) | 80,93 % | 64,11 % | 75,38 % |
| WH_CS (acepta feedback correcto) | 81,10 % | 63,86 % | 75,41 % |
| CH_CS (ambos correctos) | 99,96 % | 99,74 % | 99,89 % |
| WH_WS (ambos erroneos) | 78,86 % | 59,81 % | 72,57 % |
| Precision global | 85,21 % | 71,88 % | 80,81 % |
| Balanced Score (R+C)/2 | 81,02 % | 63,98 % | 75,40 % |

Con tres fraseos de feedback no vistos en entrenamiento, agregados sobre los cuatro fraseos: precision global 80,46 % y Balanced Score 75,47 %. El modelo base Qwen3-0.6B obtiene en el mismo test 53,98 % de precision global y 56,27 % de Balanced Score.

Precision en validacion por epoca:

| Epoca | Global | CH_WS | WH_CS | CH_CS | WH_WS |
|---|---|---|---|---|---|
| 0 (base) | 52,7 % | 50,8 % | 57,9 % | 100,0 % | 2,2 % |
| 1 | 78,7 % | 72,0 % | 72,1 % | 99,9 % | 70,8 % |
| 2 | 80,1 % | 74,4 % | 74,5 % | 99,8 % | 71,9 % |
| 3 (seleccionada) | 80,5 % | 75,0 % | 74,8 % | 99,8 % | 72,3 % |

## Requisitos de hardware

- VRAM estimada para inferencia: en bfloat16, aproximadamente 1,2 GB de pesos mas overhead de activaciones y cache KV; en fp32, unos 2,4 GB. Cabe holgadamente en cualquier GPU consumer con 4 GB o mas.
- GPU recomendadas: cualquier GPU moderna con soporte bf16 (RTX 3060/4060 en adelante, RTX 4090, A40, A100, H100). El entrenamiento se realizo en una A40 con 16,8 GB de pico.
- Cabe en GPU consumer: si, en practicamente todas las GPU dedicadas recientes y en muchas integradas con suficiente memoria compartida.
- Opciones de despliegue: transformers (libreria indicada por el autor), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`), y en general cualquier runtime compatible con safetensors de Qwen3. No se documentan recetas especificas para vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la informacion proporcionada. Por el tamano (596 M de parametros) se espera baja latencia en GPU consumer, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| yjjj1/qwen3-0.6b-balanced-sft | 596 M | no disponible | SFT para resistencia a sicofancia en opcion multiple (ARC) | Apache 2.0 | Hugging Face |
| Qwen/Qwen3-0.6B | 596 M (no confirmado en la busqueda) | no disponible | Modelo base generalista con modo thinking | Apache 2.0 (heredada) | Hugging Face |
| banghua/Qwen3-0.6B-SFT | no disponible | no disponible | SFT conversacional general con TRL | no disponible | Hugging Face |

No se dispone de datos de benchmarks comparativos entre estos modelos mas alla de la comparacion con el base en ARC incluida en la model card (80,81 % frente a 53,98 % de precision global).

## Limitaciones y advertencias

- Modelo de investigacion acotado: entrenado exclusivamente sobre ARC en ingles; el rendimiento fuera de ese dominio y formato no esta evaluado y probablemente sea pobre.
- Formato rigido: espera preguntas de opcion multiple con letras A/B/C/D y feedback en el formato de entrenamiento. Desviarse del formato degrada la salida.
- Requiere `enable_thinking=False`; con el modo thinking activado el comportamiento no esta validado.
- La respuesta debe extraerse de los logits de los tokens A/B/C/D, no como texto libre generado.
- Riesgo de alucinacion en preguntas fuera de ARC o cuando el modelo no conoce la respuesta; el ajuste no incorpora datos de conocimiento general.
- Sesgos: heredados del corpus de Qwen3-0.6B y del dataset ARC (temario cientifico de nivel escolar, sesgo cultural y linguistico del ingles estadounidense).
- Solo ingles; no se evaluo comportamiento multilingue.
- Licencia Apache 2.0 permite uso comercial, pero el modelo no esta pensado ni validado para produccion; el autor no ofrece garantias.
- El tokenizer puede mostrar un aviso de regex de Mistral en Transformers 4.57; segun el autor es inocuo porque los ficheros son identicos a los de Qwen3-0.6B original.
- Proyecto de curso con 0 descargas y 0 likes en el momento de la consulta; sin mantenimiento ni soporte comunitario documentado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yjjj1/qwen3-0.6b-balanced-sft
- Modelo base Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
- Ajuste SFT alternativo sobre Qwen3-0.6B: https://huggingface.co/banghua/Qwen3-0.6B-SFT
- Dataset ARC (allenai/ai2_arc): https://huggingface.co/datasets/allenai/ai2_arc
