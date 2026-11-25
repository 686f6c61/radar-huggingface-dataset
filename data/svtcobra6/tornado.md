# svtcobra6/tornado

## Resumen

`svtcobra6/tornado` es un adaptador LoRA de tipo DreamBooth para generación de texto a imagen, entrenado sobre el checkpoint `krea/Krea-2-Raw` y pensado para ejecutarse sobre `krea/Krea-2-Turbo`, el checkpoint destilado de 8 pasos de la familia Krea 2. Lo publica el usuario `svtcobra6` en Hugging Face bajo licencia Apache 2.0 y con la librería `diffusers`. El repositorio ocupa 1,0 GB y contiene pesos en formato safetensors.

El modelo resuelve un problema acotado: incorporar un concepto o estilo concreto (activado mediante la palabra disparadora `TOK`) a un pipeline de difusión Krea 2 sin reentrenar el modelo base. La arquitectura subyacente es la del modelo base Krea 2, un modelo de difusión texto-imagen, aunque la información disponible no detalla su variante interna (UNet, transformer de difusión o híbrido), su número de parámetros ni su longitud de contexto textual.

Su relevancia es limitada y muy específica: se trata de un adaptador de nicho con 19 descargas y 0 likes en el momento de la consulta, creado en noviembre de 2026. Resulta útil como ejemplo práctico del flujo de entrenamiento DreamBooth para Krea 2 documentado en `diffusers` (entrenar sobre RAW, inferir sobre Turbo) y como pieza reutilizable para quien quiera reproducir o extender ese pipeline con su propio concepto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre modelo de difusión texto-imagen Krea 2; arquitectura interna del base no disponible |
| Parametros totales | no disponible (el repo pesa 1,0 GB; el número de parámetros del adaptador no se indica) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el ejemplo oficial usa `torch.bfloat16`) |
| Idiomas soportados | no disponible (la generación es texto a imagen; el idioma de los prompts depende del modelo base) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (LoRA para `diffusers`) |

## Arquitectura y entrenamiento

El adaptador se entrena con DreamBooth sobre `krea/Krea-2-Raw`, el checkpoint no destilado de Krea 2, utilizando el entrenador oficial de Krea 2 en `diffusers` (`examples/dreambooth/README_krea2.md`). Krea 2 se distribuye como dos checkpoints complementarios: RAW, pensado para fine-tuning, y Turbo, un checkpoint destilado de 8 pasos para inferencia rápida y de alta calidad. La recomendación del autor es entrenar el LoRA sobre RAW y ejecutarlo sobre Turbo, ya que los LoRA entrenados sobre RAW se expresan con fuerza sobre Turbo.

No se han publicado detalles sobre el dataset de entrenamiento (número de imágenes, composición, resolución), la configuración de hiperparámetros (rango del LoRA, alpha, tasa de aprendizaje, número de pasos) ni si hubo regularización. La model card incluye secciones de "Training details" y "Limitations and bias" sin completar (marcadas como TODO), de modo que esa información no está disponible. Tampoco se documenta ninguna innovación técnica propia más allá del uso del recetario Turbo de 8 pasos sin classifier-free guidance (`guidance_scale=0.0`).

## Capacidades

- Generación de imágenes a partir de prompts de texto mediante el pipeline `Krea2Pipeline` de `diffusers`.
- Inyección de un concepto o estilo personalizado mediante la palabra disparadora `TOK`.
- Compatibilidad con el modo de inferencia rápida de Krea 2 Turbo: 8 pasos de muestreo y sin classifier-free guidance.
- Carga, ponderación, fusión y combinación con otros adaptadores LoRA mediante la API estándar de `diffusers` (`load_lora_weights`, fusión de LoRA).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento; es un adaptador puramente generativo de imagen.
- Capacidades multilingües: no documentadas; dependen del codificador de texto del modelo base.

## Casos de uso

- Prototipado de conceptos visuales: entrenar y aplicar el LoRA con `TOK` para generar variaciones de un concepto concreto sobre Krea 2 Turbo en 8 pasos, útil para explorar direcciones de diseño con coste de inferencia bajo.
- Producción de assets para un blog o documentación técnica: generar ilustraciones coherentes con un estilo fijo usando la misma palabra disparadora en todos los prompts.
- Reproducción del flujo DreamBooth de Krea 2: servir como referencia práctica de cómo entrenar sobre RAW y desplegar sobre Turbo, útil para equipos que quieran montar su propio pipeline de fine-tuning.
- Composición de estilos con otros LoRA: cargar `svtcobra6/tornado` junto a otros adaptadores y ajustar pesos para mezclar el concepto `TOK` con estilos adicionales.
- Pruebas de integración en `diffusers`: validar pipelines de carga de adaptadores, conversión de dtype (`bfloat16`) y ejecución en GPU antes de adoptar Krea 2 en un flujo mayor.
- Generación de imágenes de referencia para iteración creativa: producir rápidamente borradores visuales con el checkpoint Turbo y refinar después con más pasos o con el checkpoint RAW.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma específica. El adaptador pesa 1,0 GB en disco; la VRAM vendrá determinada por el modelo base Krea 2 Turbo cargado en `bfloat16`, cuyo tamaño no se detalla en la información proporcionada.
- GPU recomendadas: no disponibles. El ejemplo oficial usa `torch.bfloat16` y `.to("cuda")`, lo que requiere una GPU con soporte de bfloat16 (generaciones Ampere o posteriores, como A100, H100 o RTX 30/40).
- Compatibilidad con GPU de consumo: no confirmada; depende del tamaño del modelo base, que no se especifica.
- Opciones de despliegue: `diffusers` con `Krea2Pipeline` (flujo documentado). No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un modelo de difusión de este tipo.
- Latencia y throughput: no disponibles. El recetario Turbo de 8 pasos sin CFG está pensado para reducir el coste de inferencia frente a muestreos más largos, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `svtcobra6/tornado` | LoRA DreamBooth sobre Krea 2 | no disponible (repo de 1,0 GB) | no disponible | Apache 2.0 | Hugging Face, 19 descargas |
| `krea/Krea-2-Raw` | Modelo base de difusión texto-imagen | no disponible | no disponible | no disponible en la información | Hugging Face (referenciado) |
| `krea/Krea-2-Turbo` | Modelo base destilado, 8 pasos | no disponible | no disponible | no disponible en la información | Hugging Face (referenciado) |

No se dispone de datos de rendimiento ni de otras alternativas comparables en la información proporcionada.

## Limitaciones y advertencias

- La model card está generada automáticamente e incluye secciones sin completar ("Training details", "Limitations and bias", ejemplo de uso pendiente), por lo que faltan datos clave para evaluar el adaptador.
- No se documenta el dataset de entrenamiento, lo que impide conocer sesgos introducidos por el concepto `TOK` ni el riesgo de sobreajuste.
- Riesgo de alucinación visual y de artefactos propio de los modelos de difusión; no hay evaluaciones publicadas que lo cuantifiquen.
- El adaptador solo funciona correctamente con la palabra disparadora `TOK` y sobre la familia Krea 2; no es portable a otros modelos base.
- El rendimiento depende del checkpoint de inferencia: está pensado para Turbo con 8 pasos y `guidance_scale=0.0`; usarlo con otros ajustes puede degradar la calidad.
- Licencia Apache 2.0 declarada para el adaptador, pero el uso comercial del modelo base Krea 2 depende de su propia licencia, que no se detalla en la información disponible.
- Sin métricas de calidad, sin demos y con un historial mínimo (0 likes, 19 descargas): no recomendable como dependencia de producción sin evaluación propia previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/svtcobra6/tornado
- Modelo base Krea 2 Raw: https://huggingface.co/krea/Krea-2-Raw
- Modelo base Krea 2 Turbo: https://huggingface.co/krea/Krea-2-Turbo
- DreamBooth (paper): https://dreambooth.github.io/
- Entrenador Krea 2 en diffusers: https://github.com/huggingface/diffusers/blob/main/examples/dreambooth/README_krea2.md
- Documentación de carga de LoRA en diffusers: https://huggingface.co/docs/diffusers/main/en/using-diffusers/loading_adapters
- Repositorio diffusers: https://github.com/huggingface/diffusers
