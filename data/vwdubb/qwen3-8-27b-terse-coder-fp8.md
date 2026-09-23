# vwdubb/Qwen3.8-27b-Terse-Coder-FP8

# Qwen3.8-27b-Terse-Coder-FP8 (vwdubb)

## Resumen
Qwen3.8-27b-Terse-Coder-FP8 es una cuantizacion en FP8 del modelo
Shockem/Qwen3.8-27b-Terse-Coder, publicada por el usuario vwdubb. Se
trata de un artefacto derivado: no introduce entrenamiento nuevo, sino
que comprime los pesos del modelo base mediante la libreria
compressed-tensors para reducir el espacio en disco y la huella de
memoria en inferencia, manteniendo el comportamiento del original.

El modelo base es, a su vez, un fine-tune completo de Qwen/Qwen3.8-27B
(aunque las etiquetas del repositorio apuntan a la familia qwen3_5),
ajustado con DPO para reducir de forma agresiva el numero de tokens de
razonamiento en tareas de codigo sin degradar la correccion. Segun la
model card del autor original, la ronda 8 de este estudio consigue
recortes de razonamiento del orden del 95 % frente a la cuantizacion
NVFP4 de NVIDIA y del 52 % frente a Signal-3.8-27B, manteniendo
puntuaciones altas en HumanEval+, MBPP+, GSM8K y GPQA-Diamond.

La relevancia de esta publicacion concreta es limitada: se trata de un
repositorio sin descargas ni interacciones en el momento de la ficha, y
la propia model card del modelo base identifica la variante NVFP4 como
el despliegue probado. Aun asi, esta version FP8 resulta interesante
para quienes prefieren el formato safetensors con compressed-tensors en
lugar de modelopt/NVFP4, siempre que se asuma que no hay benchmarks
publicados especificamente para este artefacto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3.8, etiqueta qwen3_5) |
| Parametros totales | 27.781.427.952 (~27,8 mil millones) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (formato compressed-tensors) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors) |
| Tamano del repositorio | 38,5 GB |
| Modelo base | Shockem/Qwen3.8-27b-Terse-Coder (relacion: quantized) |
| Fecha de creacion | 2026-09-23 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento
El modelo subyacente es un transformer denso de aproximadamente 27,8 mil
millones de parametros. Segun la model card del modelo base, se trata de
un fine-tune completo de Qwen/Qwen3.8-27B en el que se ha fusionado un
adaptador DPO de la ronda 8 del estudio Terse-Coder. El objetivo del
entrenamiento es reducir los tokens de razonamiento (chain-of-thought)
en tareas de codigo manteniendo la correccion, mediante preferencias DPO
construidas a partir de trazas procedentes de Signal-3.8-27B, la
cuantizacion NVFP4 de NVIDIA y una variante abliterada del propio autor.
El entrenamiento se realizo contra HumanEval con 600 preguntas por
ronda.

Esta version concreta (vwdubb/Qwen3.8-27b-Terse-Coder-FP8) no aporta
entrenamiento adicional: es una conversion de los pesos del modelo
fusionado a FP8 mediante compressed-tensors. No hay informacion sobre
el proceso exacto de calibracion, los grupos de cuantizacion ni que
capas se han dejado en precision alta. El modelo base documenta
compatibilidad con decodificacion especulativa MTP (multi-token
prediction) con una tasa de aceptacion medida de 0,41 en la variante
NVFP4; no se confirma si esta version FP8 conserva el stack MTP.

## Capacidades
- Generacion de texto y razonamiento con modo thinking (tokens de
  deliberacion visibles en `completion_tokens_details.reasoning_tokens`).
- Razonamiento de codigo con presupuesto de pensamiento reducido: el
  modelo base esta especificamente entrenado para gastar mucho menos
  CoT que un Qwen3.8-27B estandar en tareas de programacion.
- Razonamiento cientifico de nivel doctoral medido en GPQA-Diamond, con
  capacidad de escalar el esfuerzo en problemas dificiles (mediana 884
  tokens, maximo 16k en la variante NVFP4).
- Ejecucion en flujos agenticos de codigo: el autor reporta pruebas con
  un harness interno de 30 tareas (facil/medio/dificil) con resultados
  cercanos al 100 %.
- Generacion de codigo verificable contra tests automaticos (HumanEval+,
  MBPP+ con EvalPlus).
- Capacidades multilingues: no disponibles en la informacion
  proporcionada.
- Soporte de tool calling / function calling: no documentado
  explicitamente en la informacion disponible (los modelos Qwen3 de la
  misma generacion suelen soportarlo, pero no se confirma aqui).
- Vision, audio u otras modalidades: no disponibles.

## Casos de uso
- Asistente de programacion local en estaciones de trabajo con 1 o 2
  GPUs de gama alta: el recorte de tokens de razonamiento reduce la
  latencia percibida en autocompletado y generacion de parches, y el
  formato FP8 permite cargar los pesos en menos VRAM que la version
  fp16 (~52 GB).
- Agentes de codigo autonomos multi-paso: el modelo base fue evaluado
  con un harness agentico de 30 tareas; un agente que itera sobre
  repositorios se beneficia de que el modelo deje de "pensar en
  exceso" y produzca ediciones mas rapidas.
- Generacion de tests unitarios y correccion de codigo en pipelines de
  CI: la puntuacion de 91,5 % en HumanEval+ del artefacto NVFP4 del
  modelo base sugiere utilidad para reparar builds y escribir tests,
  aunque no hay benchmark especifico de este FP8.
- Razonamiento cientifico asistido (GPQA-Diamond 79,8 % en el NVFP4 del
  modelo base): util para responder preguntas tecnicas de nivel
  avanzado en un entorno de investigacion local, con la ventaja de
  consumir muchos menos tokens de deliberacion.
- Resolucion de problemas matematicos de nivel escolar/universitario:
  GSM8K 98,5 % en el artefacto NVFP4, con una media de solo 93 tokens
  de razonamiento por pregunta.
- Despliegue en servidores con vLLM: el formato compressed-tensors FP8
  es compatible con vLLM en GPUs con soporte de FP8 (Hopper, Ada
  Lovelace, Blackwell), lo que permite servirlo como API compatible
  OpenAI.
- Prototipado e investigacion sobre "terseness": util para quienes
  quieran estudiar empíricamente como varia el comportamiento de un
  modelo al cuantizarlo a FP8 frente a fp16 o NVFP4.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks especificos para este
artefacto FP8 en la informacion disponible.

Los siguientes datos corresponden a la cuantizacion NVFP4 del modelo
base (Shockem/Qwen3.8-27b-Terse-Coder-NVFP4), medida con vLLM 0.28,
thinking activado, y se incluyen unicamente como referencia del
comportamiento esperado del modelo subyacente:

| Benchmark | Puntuacion | Tokens de razonamiento (media / mediana) |
|---|---|---|
| GSM8K (n=200) | 98,5 % | 93 / 77 |
| GPQA-Diamond (198) | 79,8 % | 1.685 / 884 |
| HumanEval+ (164, EvalPlus greedy) | 91,5 % (base: 93,9 %) | 37 / 28 |
| MBPP+ (378, EvalPlus greedy) | 79,4 % (base: 92,9 %) | 88 / 25 |
| CRUXEval (ronda 7, 800) | 92,1 % I / 92,9 % O | no disponible |
| Probe interno held-out (40 problemas) | 61 % (ronda 8 merge) | ~38 |

Aviso: no se debe asumir que esta version FP8 reproduzca exactamente
esas cifras. La propia model card del modelo base documenta una "tasa
de atenuacion por merge" especifica de la forma fusionada de 4 bits, y
no hay mediciones equivalentes para FP8.

## Requisitos de hardware
- VRAM estimada en FP8: aproximadamente 28 GB solo para pesos (27,8
  mil millones de parametros a ~1 byte por parametro), mas cache KV y
  overhead del runtime. Presupuesto realista: 32-40 GB para servicio.
- El repositorio ocupa 38,5 GB, por lo que conviene disponer de ese
  espacio en disco ademas del espacio para cache.
- GPU recomendadas: A100 80 GB, H100 80 GB, L40S 48 GB, RTX 5090 32 GB
  (ajustada), 2 x RTX 4090 24 GB (48 GB agregados), 2 x RTX 5060 Ti
  16 GB (32 GB agregados, configuracion usada por el autor del modelo
  base para la variante NVFP4).
- En una unica GPU de consumo de 24 GB (RTX 4090, 3090) no cabe con
  comodidad; requiere dos GPUs o cuantizacion adicional.
- Opciones de despliegue: vLLM es la ruta probada por el autor del
  modelo base (aunque para NVFP4). El formato compressed-tensors FP8 es
  compatible con vLLM. Otras opciones como TGI, SGLang o llama.cpp no
  estan confirmadas para este artefacto.
- Latencia y throughput: no disponibles para esta variante FP8. La
  model card del modelo base afirma que la cuantizacion NVFP4 mantiene
  la velocidad de pared del modelo base y conserva la decodificacion
  especulativa MTP (aceptacion 0,41); no se confirma lo mismo en FP8.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Estado / notas |
|---|---|---|---|---|
| vwdubb/Qwen3.8-27b-Terse-Coder-FP8 | 27,8 B | FP8 (compressed-tensors) | apache-2.0 | Esta ficha. Sin benchmarks propios publicados |
| Shockem/Qwen3.8-27b-Terse-Coder | 27,8 B | fp16 full (~52 GB) | apache-2.0 | Fuente del merge; artefacto con menor atenuacion por merge |
| Shockem/Qwen3.8-27b-Terse-Coder-NVFP4 | 27,8 B | NVFP4 + FP8 attention + MTP | apache-2.0 | Despliegue probado por el autor; benchmarks publicados |
| Qwen/Qwen3.8-27B | no disponible | no disponible | no disponible | Modelo base original sin el ajuste Terse-Coder |
| Shockem/Qwen3.8-27b-Terse-Coder-LoRA | adaptador | LoRA | apache-2.0 | Version en adaptador, apilable sobre otras bases |

Nota: no se dispone de datos de contexto, idiomas ni rendimiento del
Qwen3.8-27B original en la informacion proporcionada, por lo que la
comparativa se limita a formato, licencia y proposito.

## Limitaciones y advertencias
- Artefacto derivado sin benchmarks propios: no hay ninguna medicion
  publicada especificamente para esta cuantizacion FP8. Las cifras del
  modelo base corresponden a la variante NVFP4.
- Sin adopcion verificable: el repositorio registra 0 descargas y 0
  likes en el momento de la ficha, por lo que no hay evidencia de
  validacion por terceros.
- Riesgo de degradacion por cuantizacion: la model card del modelo base
  ya documenta una merma de rendimiento especifica de la forma
  fusionada de 4 bits (61 % frente a 70 % del adaptador en su probe
  interno). No hay motivo para asumir que FP8 se comporte igual, pero
  tampoco esta medido.
- No apilar el adaptador LoRA sobre este modelo: la model card advierte
  explicitamente que aplicar de nuevo la preferencia DPO sobre un
  modelo ya fusionado acorta en exceso el razonamiento y provoca fallos
  de tipo `no_code` (63 % de exito en las pruebas del autor).
- La reduccion de tokens de razonamiento es un trade-off deliberado: en
  tareas muy alejadas del dominio de codigo, el presupuesto de
  deliberacion puede ser insuficiente. El autor argumenta que el modelo
  escala esfuerzo en problemas dificiles, pero es una afirmacion
  medida en NVFP4, no en FP8.
- Licencia apache-2.0: permite uso comercial, pero el modelo base
  hereda a su vez de Qwen/Qwen3.8-27B, cuya licencia no se detalla en
  la informacion proporcionada. Conviene verificar la cadena completa
  de licencias antes de un despliegue comercial.
- Idiomas y contexto no disponibles: no se puede garantizar cobertura
  multilingue ni ventanas largas sin consultar la documentacion del
  modelo base original.
- Sin documentacion sobre sesgos: no hay evaluaciones de sesgo,
  toxicidad ni alineacion en la informacion disponible.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; el ajuste
  Terse-Coder reduce el tiempo de deliberacion, lo que teoricamente
  puede aumentar el riesgo de respuestas rapidas incorrectas en tareas
  fuera de distribucion.

## Enlaces
- Repositorio HuggingFace de esta cuantizacion:
  https://huggingface.co/vwdubb/Qwen3.8-27b-Terse-Coder-FP8
- Modelo base (merge fp16):
  https://huggingface.co/Shockem/Qwen3.8-27b-Terse-Coder
- Adaptador LoRA Terse-Coder:
  https://huggingface.co/Shockem/Qwen3.8-27b-Terse-Coder-LoRA
- Cuantizacion NVFP4 de referencia:
  https://huggingface.co/Shockem/Qwen3.8-27b-Terse-Coder-NVFP4
- Modelo original de Qwen:
  https://huggingface.co/Qwen/Qwen3.8-27B
- Busqueda web: no se han encontrado resultados relevantes sobre este
  modelo; los enlaces devueltos por el buscador no guardan relacion con
  el tema.
