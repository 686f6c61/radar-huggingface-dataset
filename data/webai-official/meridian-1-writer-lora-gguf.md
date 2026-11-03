# webAI-Official/Meridian-1-writer-lora-GGUF

## Resumen

Meridian-1-writer-lora-GGUF es un adaptador LoRA en formato GGUF para el modelo Meridian-1, un fine-tune de google/gemma-4-12B-it desarrollado por webAI-Official. El adaptador implementa la "persona writer": un rol especializado en generar prosa acabada con una voz, formato y estilo especificados, devolviendo siempre un objeto JSON estructurado con campos `persona`, `spec` y `body`. No es un modelo completo, sino un delta de pesos de rango 16 que se carga sobre una instancia GGUF de Meridian-1 en llama.cpp.

El repositorio contiene únicamente el adaptador en precisión f16 (~130 MB), no los pesos base. Segun los metadatos de safetensors, el modelo base tiene 65.011.712 parametros, aunque la model card describe Meridian-1 como un fine-tune de gemma-4-12B-it; esta discrepancia entre el recuento de parametros reportado y el nombre del modelo base conviene tenerla en cuenta.

La relevancia de esta ficha es acotada: se trata de un adaptador de nicho con 11 descargas y sin likes, orientado a pipelines de generacion de prosa controlada. Su valor tecnico esta en el contrato de persona estricto y en los datos de evaluacion publicados (suite de 720 casos held-out), que muestran ganancias sustanciales frente al modelo base con el mismo prompt de rol.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer decoder (gemma-4-12B-it); rango 16, alpha 32, dropout 0.05 |
| Parametros totales | 65.011.712 (segun safetensors del modelo base referenciado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (max seq len de entrenamiento: 8192) |
| Tipos de cuantizacion | adaptador en f16; el modelo base admite cuantizaciones GGUF (Q8_0 usada en el ejemplo) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (adaptador LoRA); existe version PEFT en el repo hermano |

Modulos objetivo del adaptador: `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj`.

## Arquitectura y entrenamiento

El adaptador se aplica sobre Meridian-1, un fine-tune de google/gemma-4-12B-it con la misma arquitectura y nombres de tensores. El LoRA tiene rango 16, alpha 32 y dropout 0.05, y cubre los siete modulos de atencion y MLP habituales. El entrenamiento fue SFT puro (la ejecucion DPO de esta persona no se conservo): 9.901 ejemplos, 2 epocas, learning rate 1e-4, longitud de secuencia maxima 8192, paso final 1238, perdida de entrenamiento 0.1680 y de evaluacion 0.1885.

Los objetivos de SFT son respuestas del propio gemma-4-12B-it con el prompt de rol, filtradas contra el contrato de persona y la verdad de referencia mediante un juez que elige la mejor de tres candidatas validas; un 4% de las respuestas, para peticiones que no pasaban los filtros, provienen de Granite 4.2 30B (con razonamiento limitado a 12.000 caracteres). Posteriormente el adaptador se reajusto sobre Meridian-1 durante 1 epoca con los mismos 9.901 ejemplos y learning rate 2e-5, partiendo del adaptador original: paso final 619, perdida de entrenamiento 0.1676 y de evaluacion 0.1944. La conversion a GGUF se hizo con `convert_lora_to_gguf.py` de llama.cpp (commit 5cdadfc).

## Capacidades

- Generacion de prosa acabada en una voz, formato y estilo especificados por el usuario.
- Salida estructurada garantizada: un unico objeto JSON con campos obligatorios `persona` (siempre `"writer"`), `spec` y `body`; campos opcionales `deviations` y `handoff`.
- Cumplimiento estricto de un contrato de persona, incluida la negativa correcta a peticiones fuera de alcance (90,6% en la suite de evaluacion).
- Mantenimiento del rol bajo presion adversarial (91,1% de exito en los casos de la suite).
- Modo de razonamiento desactivado (`enable_thinking: false`), tal como se entreno.
- Presupuesto de generacion de hasta 2.048 tokens nuevos por respuesta.
- No soporta tool calling, vision, audio ni razonamiento multi-paso de forma nativa segun la informacion disponible.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Generacion de copy de marketing con voz de marca fija: el adaptador recibe una especificacion de tono y formato y devuelve un JSON con el cuerpo del texto, lo que permite integrarlo en un CMS sin parseo fragil.
- Redaccion de articulos y notas de prensa en pipelines editoriales: el contrato de persona y el campo `deviations` permiten auditar cuando el modelo se aparta de la especificacion solicitada.
- Produccion de descripciones de producto a escala: la salida JSON estructurada encaja directamente en un esquema de base de datos o en un sistema de publicacion automatizada.
- Generacion de guiones y textos narrativos con estilo controlado: el campo `spec` documenta la voz aplicada, util para mantener consistencia entre lotes de generacion.
- Moderacion de alcance en asistentes de escritura: la alta tasa de negativa correcta a peticiones fuera de alcance (90,6%) lo hace adecuado para sistemas donde el modelo solo debe responder dentro de su dominio.
- Evaluacion de calidad de prosa en pipelines de investigacion: los datos de la suite de contrato permiten reproducir la comparacion adaptador frente a modelo base con el mismo prompt de rol.
- Despliegue local en llama.cpp: al ser un adaptador de ~130 MB sobre un GGUF base, se puede servir con `llama-server` y `--lora` en entornos sin GPU de gran capacidad, segun la cuantizacion del modelo base.

## Benchmarks y rendimiento

Suite de contrato de persona sobre 720 casos held-out, adaptador frente a Meridian-1 con el mismo prompt de rol (temperatura 1.0, top-p 0.95, top-k 64). Porcentajes.

| Metrica | Adaptador | Meridian-1 (con prompt de rol) | Ganancia (pts) |
|---|---:|---:|---:|
| Tasa global de cumplimiento del contrato | 91,4 | 59,3 | +32,1 |
| Envoltorio de salida de persona valido | 99,2 | 93,3 | +5,8 |
| Tareas en alcance superadas | 86,7 | 76,7 | +10,0 |
| Negativa correcta a peticiones fuera de alcance | 90,6 | 36,7 | +53,9 |
| Mantiene el rol bajo presion adversarial | 91,1 | 51,7 | +39,4 |
| Peticiones generales gestionadas en rol | 97,2 | 72,2 | +25,0 |

Trabajo propio sobre items held-out, adaptador frente a Meridian-1 con el mismo prompt de rol (intervalo bootstrap pareado al 95%):

| Tarea | Adaptador | Meridian-1 (con prompt de rol) | Ganancia (pts) | Intervalo 95% | Items |
|---|---:|---:|---:|---|---:|
| Brief cumplido (puntos requeridos, longitud, nada inventado) | 95,4 | 88,7 | +6,6 | +1,3 a +11,9 | 151 |

Nota del autor: la evaluacion se realizo con vLLM sobre los pesos PEFT, no con llama.cpp sobre el GGUF; aun no se ha probado con llama.cpp sobre Meridian-1.

## Requisitos de hardware

- El adaptador en si ocupa ~130 MB en f16; el requisito real lo marca el modelo base Meridian-1.
- VRAM estimada para el modelo base: no disponible en la informacion proporcionada; depende de la cuantizacion GGUF elegida (el ejemplo de la model card usa Q8_0).
- GPU recomendadas: no disponibles. La model card no especifica requisitos de GPU.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible.
- Despliegue: llama.cpp (`llama-server` con `--lora` o `--lora-scaled` y `--jinja`); la evaluacion se hizo con vLLM sobre pesos PEFT.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de comparativas con otros adaptadores de persona en la informacion proporcionada. La unica comparacion publicada es contra el propio modelo base con prompt de rol, recogida en la seccion de benchmarks. Alternativas comparables (otros LoRA de persona sobre gemma-4-12B-it o sobre Meridian-1): no disponibles.

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Meridian-1-writer-lora-GGUF | adaptador LoRA (base 65.011.712 segun safetensors) | no disponible | no disponible | GGUF | HuggingFace |
| Meridian-1-writer-lora-peft | mismos pesos en PEFT | no disponible | no disponible | PEFT | HuggingFace |
| gemma-4-12b-it-writer-lora-peft | adaptador LoRA sobre gemma-4-12B-it | no disponible | no disponible | PEFT | HuggingFace |

## Limitaciones y advertencias

- El adaptador solo funciona correctamente con el system prompt exacto documentado, incluido el salto de linea antes de `Respond with a single JSON object.`; fuera de esa distribucion de entrenamiento su comportamiento no esta garantizado.
- Requiere `enable_thinking: false`; activar el razonamiento lo saca de las condiciones de entrenamiento.
- No se ha probado con llama.cpp sobre Meridian-1: la evaluacion publicada es de vLLM con los pesos PEFT, por lo que el rendimiento del GGUF puede diferir.
- Licencia no disponible: no se puede confirmar el uso comercial. Ademas, al derivar de gemma-4-12B-it, quedaria sujeto a las condiciones del modelo base.
- Idiomas soportados no disponibles; no hay evidencia de cobertura multilingue.
- Riesgo de alucinacion: la metrica de "brief met" incluye "nada inventado" con un 95,4% en 151 items, lo que implica un margen de error no nulo en la fidelidad al material de partida.
- El adaptador no incorpora DPO (la ejecucion se descarto), por lo que la alineacion depende exclusivamente del SFT.
- Presupuesto de generacion limitado a 2.048 tokens nuevos; textos mas largos requeriran truncado o generacion por partes.
- Modelo de nicho con 11 descargas y 0 likes: sin validacion independiente por parte de la comunidad.
- Discrepancia entre el recuento de parametros de safetensors (65 millones) y la denominacion gemma-4-12B-it del modelo base; conviene verificar el modelo base real antes de desplegar.

## Enlaces

- HuggingFace del adaptador GGUF: https://huggingface.co/webAI-Official/Meridian-1-writer-lora-GGUF
- Modelo base Meridian-1: https://huggingface.co/webAI-Official/Meridian-1
- Version PEFT del adaptador: https://huggingface.co/webAI-Official/Meridian-1-writer-lora-peft
- Adaptador original sobre gemma-4-12B-it: https://huggingface.co/webAI-Official/gemma-4-12b-it-writer-lora-peft
- Modelo base de Google: https://huggingface.co/google/gemma-4-12B-it
- Script de conversion de llama.cpp: `convert_lora_to_gguf.py` (commit 5cdadfc)
