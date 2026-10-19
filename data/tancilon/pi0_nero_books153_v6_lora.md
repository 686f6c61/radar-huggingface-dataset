# tancilon/pi0_nero_books153_v6_lora

# pi0_nero_books153_v6_lora

## Resumen

`pi0_nero_books153_v6_lora` es un checkpoint publicado en HuggingFace por el usuario `tancilon`. Según la model card, se trata de un checkpoint completo de OpenPI procedente del run `books153_full`, en el paso de entrenamiento 30000. El archivo conserva el directorio `30000/` completo, con `params/`, `assets/`, `train_state/` y `_CHECKPOINT_METADATA`, empaquetado en un tar.gz de 9,5 GB y 41 ficheros.

El nombre y el tag `openpi` sugieren un ajuste LoRA sobre un modelo de la familia pi0, orientada a políticas vision-language-action (VLA), pero la model card no confirma la arquitectura del modelo base, el dataset utilizado, la licencia ni las capacidades resultantes. Tampoco se documentan hiperparámetros de entrenamiento, evaluación o benchmarks.

Su relevancia actual es limitada y muy específica: sirve como artefacto de reproducibilidad y reanudación de un entrenamiento concreto en el ecosistema OpenPI, no como un modelo listo para inferencia general o despliegue en producción. Con 0 descargas, 0 likes y sin licencia declarada, debe tratarse como un checkpoint de investigación interno.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en la model card; el tag `openpi` y el nombre `pi0_...` sugieren un fine-tuning LoRA sobre un modelo de la familia pi0 (VLA), sin confirmación explícita |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el repositorio contiene un checkpoint de entrenamiento completo,
