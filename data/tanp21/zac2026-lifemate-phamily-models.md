# tanp21/zac2026-lifemate-phamily-models

## Resumen

LifeMate (Zalo AI Challenge 2026, equipo Phamily) es un paquete de pesos entrenados para un agente de voz offline en vietnamita que encadena reconocimiento automatico del habla (ASR) y un LLM con capacidad de tool calling. No se trata de un unico modelo, sino de un repositorio que agrupa cuatro adaptadores LoRA sobre `Qwen/Qwen3.5-4B`, un adaptador LoRA sobre `vinai/PhoWhisper-large` y un ajuste completo del modelo ASR `g-group-ai-lab/gipformer1.5-68M-rnnt` exportado a ONNX para sherpa-onnx. El objetivo es desplegar un asistente conversacional por voz completamente local, sin dependencia de servicios en la nube.

El LLM que se distribuye para inferencia no es un adaptador aislado, sino una mezcla ponderada (model soup) de los cuatro LoRA con pesos 0.2, 0.5, 0.15 y 0.15, fusionada sobre la base Qwen3.5-4B en bf16. El ASR se entrega como PhoWhisper-large con su LoRA fusionado en fp16, y el gipformer como tres ficheros ONNX (encoder, decoder y joiner) listos para sherpa-onnx. El repositorio ocupa 1.5 GB e incluye un `MANIFEST.json` con los sha256 de cada fichero de inferencia.

La relevancia del artefacto es acotada pero concreta: es una instantanea reproducible de una participacion en un challenge, congelada en la fecha limite del Docker (16 de noviembre de 2026), con instrucciones exactas de fusion y verificacion. Resulta util como referencia de receta de destilacion de adaptadores y de empaquetado de un pipeline ASR + LLM para vietnamita, no como modelo generalista listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLM transformer decoder-only (Qwen3.5-4B) con adaptadores LoRA; ASR Whisper-large con LoRA; ASR RNNT gipformer exportado a ONNX |
| Parametros totales | 4B en el LLM base (Qwen3.5-4B); 68M en el gipformer; PhoWhisper-large sin cifra publicada en la informacion disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 para el LLM fusionado, fp16 para Whisper, ONNX para gipformer; no se documentan otras cuantizaciones |
| Idiomas soportados | vietnamita (vi) |
| Licencia | Apache-2.0 (repo y LLM); BSD-3-Clause (PhoWhisper-large); MIT (gipformer) |
| Formato de pesos | safetensors (adaptadores PEFT y LLM fusionado), ONNX (gipformer), ficheros de configuracion PEFT |

## Arquitectura y entrenamiento

El componente linguistico parte de `Qwen/Qwen3.5-4B` (revision `851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a`) y se entrena mediante cuatro adaptadores LoRA de rango 32 y alpha 64, cada uno sobre una mezcla SFT distinta: `e3b-full`, `e3b-calib3-full`, `e3b-dev` y `e3b-calib2-tts`. Para inferencia se aplica un model soup con pesos 0.2, 0.5, 0.15 y 0.15 respectivamente, fusionado en bf16 con el script `scripts/merge_lora.py`. Este esquema permite combinar especializaciones (calibracion, desarrollo, TTS) sin reentrenar desde cero, y el resultado se valida contra los sha256 del `MANIFEST.json`.

El pipeline de voz combina dos ASR. Por un lado, `vinai/PhoWhisper-large` (revision `b9136a44b5f2ca664bd0b8f74baecf1715f6eeeb`) con un LoRA r32/alpha64 entrenado sobre todo el audio de entrenamiento, fusionado en fp16 mediante `scripts/merge_whisper_lora.py`. Por otro, `g-group-ai-lab/gipformer1.5-68M-rnnt` (revision `dd9227dcd8705c13f33bdbe59728d546ab94480f`), ajustado como modelo completo y exportado a sherpa-onnx. Los datos de entrenamiento son el split de entrenamiento del organizador del ZAC 2026 LifeMate mas datos sinteticos propios; las mezclas SFT no se redistribuyen y se alojan en un dataset separado con acceso restringido por contener material del organizador. No se documentan en la informacion disponible ni el numero de tokens, ni la composicion exacta del dataset, ni si hubo RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento en vietnamita sobre la base Qwen3.5-4B.
- Tool calling / function calling, segun el tag `tool-calling` del repositorio y el diseno del agente.
- Comportamiento de agente multi-paso para un asistente de voz domestico (LifeMate).
- ASR en vietnamita con dos alternativas: PhoWhisper-large ajustado y gipformer1.5-68M-rnnt en ONNX.
- Ejecucion completamente offline del pipeline ASR → LLM.
- Capacidad de sintesis de voz integrada en el flujo, inferida del identificador de mezcla `e3b-calib2-tts`; no se detalla el motor TTS en la informacion disponible.
- Soporte multilingue limitado al vietnamita declarado en la model card.

## Casos de uso

- Asistente de voz domestico offline: el pipeline ASR (PhoWhisper o gipformer) transcribe la orden en vietnamita y el LLM fusionado decide la accion mediante tool calling, sin enviar audio a la nube.
- Despliegue en dispositivos con recursos limitados: el gipformer de 68M exportado a ONNX permite ASR en sherpa-onnx en hardware modesto, complementando al LLM de 4B para entornos con poca VRAM.
- Automatizacion de tareas del hogar por comandos de voz: el agente puede encadenar varias llamadas a herramientas (calendario, domotica) en una misma conversacion gracias al comportamiento multi-paso del LLM.
- Prototipado de agentes de voz en vietnamita: sirve como receta reproducible (scripts de fusion, `MANIFEST.json` con sha256) para equipos que quieran replicar el empaquetado ASR + LLM en un contenedor Docker.
- Evaluacion comparativa de ASR en vietnamita: al incluir dos sistemas (Whisper-large ajustado y gipformer RNNT), permite medir diferencias de latencia y precision en el mismo dominio.
- Base para experimentos de model souping: los cuatro adaptadores LoRA y sus pesos permiten estudiar el efecto de distintas mezclas SFT sobre el rendimiento del agente sin reentrenar la base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para el LLM: el repositorio ocupa 1.5 GB en total, lo que sugiere pesos ya fusionados en precision reducida; un modelo de 4B en bf16 requiere del orden de 8 GB solo para pesos, y mas con cache KV y contexto largo (cifra exacta no disponible).
- GPU recomendadas: no disponibles en la informacion proporcionada; por tamano, el LLM de 4B es viable en GPUs consumer con suficiente VRAM, pero no se documenta ninguna.
- El gipformer de 68M en ONNX esta pensado para sherpa-onnx y puede ejecutarse en CPU.
- Opciones de despliegue: sherpa-onnx para el ASR gipformer; para el LLM y Whisper no se especifican runners (vLLM, llama.cpp, TGI u Ollama no aparecen en la model card).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| LifeMate Phamily (este repo) | 4B (LLM) + 68M (ASR RNNT) + Whisper-large | no disponible | vi | Apache-2.0 / BSD-3-Clause / MIT | Pipeline ASR + LLM con tool calling, offline, congelado para ZAC 2026 |
| Qwen/Qwen3.5-4B | 4B | no disponible | multilingue | Apache-2.0 | Modelo base sin ajuste; no incluye ASR ni tool calling especifico del dominio |
| vinai/PhoWhisper-large | no disponible | no disponible | vi | BSD-3-Clause | ASR vietnamita base; este repo incluye un LoRA sobre el |
| g-group-ai-lab/gipformer1.5-68M-rnnt | 68M | no disponible | vi | MIT | ASR RNNT ligero; este repo incluye un ajuste completo exportado a ONNX |

## Limitaciones y advertencias

- Artefacto de competicion congelado en la fecha limite del Docker (2026-11-16); no hay garantia de mantenimiento ni de soporte.
- Cero descargas y cero likes en el momento de la consulta: sin validacion externa de la comunidad.
- Solo vietnamita; no se declara soporte de otros idiomas.
- Los datos SFT no se redistribuyen y contienen material del organizador, lo que limita la reproducibilidad completa del entrenamiento.
- No se publican benchmarks, curvas de evaluacion ni metricas de latencia; el rendimiento real del agente es desconocido.
- Riesgo de alusionacion inherente a un LLM de 4B ajustado con LoRA sobre un dominio acotado; no se documentan mitigaciones.
- Licencias mixtas: el LLM es Apache-2.0, pero PhoWhisper-large es BSD-3-Clause y el gipformer MIT; el uso comercial debe respetar cada una por separado.
- El pipeline depende de scripts especificos (`merge_lora.py`, `merge_whisper_lora.py`) y de un `MANIFEST.json` con sha256; cualquier modificacion de pesos invalida la verificacion.
- No se documentan sesgos conocidos ni evaluaciones de seguridad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/tanp21/zac2026-lifemate-phamily-models
- Modelo base LLM: https://huggingface.co/Qwen/Qwen3.5-4B
- Modelo base ASR Whisper: https://huggingface.co/vinai/PhoWhisper-large
- Modelo base ASR gipformer: https://huggingface.co/g-group-ai-lab/gipformer1.5-68M-rnnt
- Codigo de entrenamiento: `/code/training_code/README.md` dentro de la imagen Docker enviada (no enlazado publicamente en la model card)
