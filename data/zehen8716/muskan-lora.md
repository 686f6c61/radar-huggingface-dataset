# zehen8716/muskan-lora

## Resumen

`zehen8716/muskan-lora` es un adaptador LoRA (Low-Rank Adaptation) de tipo DreamBooth entrenado sobre el modelo base Krea 2 de Krea AI, concretamente sobre el checkpoint RAW. Su proposito es permitir la generacion de imagenes de una persona concreta identificada por el prompt de activacion "muskan woman". El autor, zehen8716, ha publicado tambien otros LoRAs similares (como `kashish-lora`) siguiendo la misma metodologia.

Krea 2 se distribuye en dos checkpoints: RAW, pensado como base para fine-tuning, y Turbo, una version destilada que genera en 8 pasos sin classifier-free guidance. La recomendacion del autor es entrenar el LoRA sobre RAW y ejecutarlo sobre Turbo, ya que los adaptadores entrenados en RAW se expresan con fuerza en Turbo. El modelo se distribuye bajo licencia Apache 2.0 y se integra con la libreria diffusers de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre Krea 2 (modelo de difusion) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo text-to-image) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (prompt de activacion en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (pesos LoRA) |

## Arquitectura y entrenamiento

Se trata de un adaptador LoRA entrenado con la tecnica DreamBooth sobre el checkpoint RAW de Krea 2, un modelo de difusion de ultima generacion. El entrenamiento se realizo con el trainer oficial de Krea 2 para diffusers, tal y como se documenta en el repositorio de ejemplos de Hugging Face. Krea 2 se distribuye en dos variantes: RAW, que es la base no destilada sobre la que se realiza el fine-tuning, y Turbo, una version destilada optimizada para inferencia rapida en 8 pasos sin guidance. El LoRA se entrena sobre RAW y se carga sobre Turbo para inferencia, siguiendo la practica recomendada por el equipo de Krea.

Los detalles especificos del dataset de entrenamiento (numero de imagenes, composicion, epocas, tasa de aprendizaje) no estan documentados en la model card, que incluye secciones TODO pendientes de completar por el autor.

## Capacidades

- Generacion de imagenes de una persona concreta mediante el prompt de activacion "muskan woman".
- Integracion con el pipeline `Krea2Pipeline` de diffusers para cargar el LoRA sobre Krea 2 Turbo.
- Inferencia rapida: 8 pasos de difusion sin classifier-free guidance (guidance_scale=0.0).
- Compatibilidad con las funciones de weighting, merging y fusion de LoRAs documentadas en diffusers.
- Soporte de precision bfloat16 para inferencia en GPU.

## Casos de uso

- Avatares personalizados: generar retratos consistentes de una persona concreta en distintos escenarios, estilos y composiciones usando el prompt "muskan woman" como desencadenante.
- Contenido para redes sociales: crear imagenes de perfil o publicaciones con una identidad visual coherente, aprovechando la inferencia en 8 pasos de Krea 2 Turbo para iterar rapidamente.
- Prototipado de personajes: en produccion audiovisual o videojuegos, generar variaciones de un personaje definido sin necesidad de sesiones de fotos adicionales.
- Pruebas de concepto en diseno: generar rapidamente moodboards y referencias visuales centradas en una persona especifica para presentar a clientes.
- Fine-tuning educativo: servir como ejemplo practico de entrenamiento DreamBooth con LoRA sobre Krea 2, dado que el repositorio incluye el codigo de uso completo.
- Composicion de imagenes con contexto: al cargarse sobre Krea 2 Turbo, permite combinar el sujeto entrenado con otros prompts descriptivos para situarlo en entornos variados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de calidad de imagen (FID, CLIP score, etc.) ni comparaciones cuantitativas con otros adaptadores.

## Requisitos de hardware

- Se requiere una GPU compatible con CUDA y soporte de bfloat16, segun el ejemplo de uso oficial que emplea `torch_dtype=torch.bfloat16` y `.to("cuda")`.
- La VRAM exacta necesaria no esta documentada; dependera del checkpoint base Krea 2 Turbo sobre el que se cargue el LoRA.
- El tamano del repositorio es de 1.3 GB, que corresponde al peso del adaptador LoRA en formato safetensors.
- Opciones de despliegue: el flujo recomendado es mediante la libreria diffusers con `Krea2Pipeline`, cargando el LoRA con `load_lora_weights`.
- No se dispone de datos de latencia o throughput estimados.

## Comparativa con modelos similares

| Modelo | Base | Tecnica | Licencia | Formato |
|---|---|---|---|---|
| zehen8716/muskan-lora | Krea 2 (RAW/Turbo) | DreamBooth LoRA | Apache 2.0 | safetensors |
| zehen8716/kashish-lora | Krea 2 (RAW/Turbo) | DreamBooth LoRA | Apache 2.0 | safetensors |
| LoRAs de personaje para FLUX (p. ej. en Civitai o Tensor.Art) | FLUX.1 | LoRA | Variable (generalmente no comercial) | safetensors |

Ambos LoRAs del mismo autor comparten base, tecnica y licencia; la diferencia principal es el sujeto entrenado. Los LoRAs de personaje para FLUX son alternativas en el mismo nicho, pero sobre una base distinta, con licencias mas restrictivas y sin la ventaja de inferencia en 8 pasos de Krea 2 Turbo.

## Limitaciones y advertencias

- La model card incluye secciones TODO sin completar, por lo que no se documentan sesgos, limitaciones ni datos de entrenamiento.
- El modelo esta entrenado para un sujeto concreto ("muskan woman"); su uso fuera de ese ambito puede producir resultados inconsistentes o no deseados.
- Riesgo de alucinacion visual: como todo modelo de difusion, puede generar detalles faciales o corporales que no corresponden fielmente al sujeto real.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar que el sujeto entrenado no este sujeto a derechos de imagen o privacidad.
- Dependencia del checkpoint base: el LoRA requiere Krea 2 (RAW o Turbo) para funcionar; no es un modelo autonomo.
- No se especifican limitaciones de idioma, pero el prompt de activacion esta en ingles, lo que puede condicionar su uso con prompts en otros idiomas.

## Enlaces

- Repositorio del modelo: https://huggingface.co/zehen8716/muskan-lora
- Modelo base Krea 2 Turbo: https://huggingface.co/krea/Krea-2-Turbo
- Modelo base Krea 2 Raw: https://huggingface.co/krea/Krea-2-Raw
- Trainer de DreamBooth para Krea 2 en diffusers: https://github.com/huggingface/diffusers/blob/main/examples/dreambooth/README_krea2.md
- Documentacion de carga de LoRAs en diffusers: https://huggingface.co/docs/diffusers/main/en/using-diffusers/loading_adapters
- Modelo relacionado del mismo autor: https://huggingface.co/zehen8716/kashish-lora
