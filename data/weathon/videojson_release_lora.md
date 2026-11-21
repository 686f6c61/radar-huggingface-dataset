# weathon/videojson_release_lora

## Resumen

VideoJSON LoRA es un adaptador PEFT de tipo LoRA entrenado mediante SFT sobre el modelo base Qwen/Qwen3.5-35B-A3B, un modelo de mezcla de expertos (MoE) de la familia Qwen 3.5. Lo publica el usuario weathon como artefacto asociado al articulo "VideoJSON: A Minimal Harness Beats Purpose-Built Memory for Ultra-Long Video Understanding" (seccion 6), centrado en la comprension de video de muy larga duracion. El adaptador se ha ajustado sobre 64 trayectorias VideoJSON, que generan 352 ejemplos de entrenamiento, procedentes del conjunto MediaStorm-Livestream.

El objetivo del adaptador es que el modelo base aprenda a emitir estructuras JSON intermedias (VideoJSON) que actuen como memoria compacta y consultable de videos largos, en lugar de depender de mecanismos de memoria especificos. Se trata, por tanto, de un ajuste de proposito muy concreto y de un artefacto de investigacion, no de un modelo generalista listo para produccion.

En el momento de la consulta, el repositorio no contiene los pesos del adaptador (`adapter_model.safetensors` no esta subido) y el tamano del repo es de 0.0 GB, por lo que el artefacto no es actualmente utilizable tal cual. La licencia y los idiomas soportados no estan declarados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer MoE Qwen/Qwen3.5-35B-A3B |
| Parametros totales | no disponible (adaptador LoRA; el modelo base declara 35B en su nombre) |
| Parametros activos | no disponible (modelo base MoE; el nombre sugiere ~3B activos) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen/Qwen3.5-35B-A3B) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (PEFT); `adapter_model.safetensors` no subido al repositorio |

## Arquitectura y entrenamiento

El adaptador es un LoRA estandar de la libreria PEFT, aplicado sobre Qwen/Qwen3.5-35B-A3B, un modelo de mezcla de expertos de la familia Qwen 3.5. El entrenamiento es un SFT supervisado sobre 352 ejemplos derivados de 64 trayectorias VideoJSON del conjunto MediaStorm-Livestream. No se documentan hiperparametros de LoRA (rango, alpha, modulos objetivo), regimen de entrenamiento, numero de tokens vistos ni uso de RLHF/DPO.

La innovacion metodologica no reside en el adaptador en si, sino en el planteamiento del articulo asociado: un "harness" minimo basado en VideoJSON que supera a mecanismos de memoria disenados especificamente para comprension de video de muy larga duracion. El adaptador ensena al modelo base a producir esas representaciones JSON intermedias. Notese que `adapter_config.json` apunta `base_model_name_or_path` a la ruta local `/model` usada en entrenamiento, por lo que debe cargarse explicitamente sobre Qwen/Qwen3.5-35B-A3B.

## Capacidades

- Generacion de texto conversacional, heredada del modelo base Qwen/Qwen3.5-35B-A3B.
- Generacion de estructuras JSON (VideoJSON) como memoria intermedia para comprension de video largo, segun el articulo asociado.
- Comprension de video de muy larga duracion mediante el harness VideoJSON (capacidad del pipeline descrito, no del adaptador aislado).
- Tool calling / function calling: no disponible en la informacion proporcionada para el adaptador.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles.
- Modo thinking, vision o audio nativos: no disponibles en la informacion del adaptador.

## Casos de uso

- Investigacion en comprension de video largo: reproducir los experimentos de la seccion 6 del articulo VideoJSON cargando el adaptador sobre Qwen/Qwen3.5-35B-A3B y evaluando sobre MediaStorm-Livestream.
- Generacion de memoria estructurada de video: usar el adaptador para que el modelo emita VideoJSON que resuma segmentos de un video extenso y sirva de indice consultable.
- Destilacion de trayectorias: emplear los datos de `distill_data/` y el codigo de `distill/` para entrenar adaptadores equivalentes sobre otros modelos base.
- Analisis de retransmisiones en directo: procesar flujos tipo livestream y construir representaciones JSON que permitan busquedas posteriores sobre el contenido.
- Baseline academico: usar el adaptador como referencia para comparar harness minimos basados en JSON frente a sistemas de memoria dedicados.
- Prototipado de pipelines de video-to-JSON: integrar el adaptador en un harness que convierta descripciones de video en esquemas JSON normalizados para etapas posteriores de recuperacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El articulo asociado (seccion 6) describe la comparacion del harness VideoJSON frente a mecanismos de memoria dedicados, pero no se incluyen cifras numericas en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el adaptador; depende del modelo base Qwen/Qwen3.5-35B-A3B y de la cuantizacion empleada, no documentada.
- GPU recomendadas: no disponible.
- Cabe en GPU de consumo: no disponible; un modelo base de 35B (MoE) requiere cuantizacion agresiva para caber en GPUs de consumo, pero no se aportan datos concretos.
- Opciones de despliegue: no disponible. El adaptador es PEFT y debe cargarse sobre el modelo base; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.
- Nota critica: el repositorio no contiene actualmente `adapter_model.safetensors`, por lo que no es desplegable sin los pesos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| weathon/videojson_release_lora | LoRA sobre base 35B MoE | no disponible | no disponible | pesos no subidos |
| Qwen/Qwen3.5-35B-A3B (base) | 35B MoE | no disponible | no disponible | disponible en HF |
| Alternativas de memoria para video largo | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparables para establecer una comparativa cuantitativa con otros adaptadores o sistemas de memoria de video.

## Limitaciones y advertencias

- Los pesos del adaptador no estan subidos (`adapter_model.safetensors` ausente); el repositorio no es utilizable tal cual.
- `adapter_config.json` referencia una ruta local `/model`, por lo que la carga directa puede fallar si no se corrige `base_model_name_or_path`.
- Entrenado sobre un conjunto muy pequeno (64 trayectorias, 352 ejemplos) y especifico de MediaStorm-Livestream; riesgo alto de sobreajuste y baja generalizacion.
- Licencia no declarada: no hay autorizacion explicita para uso comercial.
- Idiomas no declarados.
- Sin datos de benchmarks, cuantizacion ni requisitos de hardware.
- Riesgo de alucinacion inherente al modelo base y acentuado por el ajuste en un dominio estrecho.
- Artefacto de investigacion sin senales de uso en produccion (0 descargas, 0 likes, creado y actualizado en noviembre de 2026).

## Enlaces

- Hugging Face: https://huggingface.co/weathon/videojson_release_lora
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-35B-A3B
- Codigo: https://github.com/weathon/videojson_release
- Datos de entrenamiento: https://huggingface.co/datasets/weathon/videojson_release
- Articulo: https://cspaper.org/openprint/20261120.0001v1.pdf
