# typestrict/TS-Ettin-32M

## Resumen

TS-Ettin-32M es un encoder de decisiones de typestrict.ai, construido sobre `cross-encoder/ettin-reranker-32m-v1`, un modelo de la familia Ettin con arquitectura ModernBERT y 32.038.402 parámetros. No es un modelo generativo: convierte una entrada de texto en una decisión tipada —elegir una opción entre varias (`choice`), determinar si una afirmación es verdadera (`noul`) o puntuar según una rúbrica ordenada (`score`)— y devuelve la probabilidad de cada opción junto con una confianza.

Su interés práctico está en el tamaño y el despliegue: 8.192 tokens de contexto, solo inglés, licencia Apache-2.0 y pesos en safetensors y ONNX que pueden ejecutarse en CPU, navegador o teléfono. Está pensado para clasificación, enrutamiento y validación de bajo coste, no para generar respuestas.

Ahora bien, la confianza no está calibrada —el propio autor lo advierte— y no hay resultados numéricos de benchmarks publicados. La model card menciona una evaluación contra Jev y una figura denominada «Decision Index 0.3», pero sin cifras. Es un modelo recién publicado, con 0 descargas y 0 likes, y forma parte de una familia (`TS-Ettin-17M`, `TS-Ettin-68M`, `TS-Ettin-150M`, `TS-moBERTo-150M`) que comparte el mismo recipe de entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder transformer ModernBERT (etiqueta `modernbert`), ajustado desde `cross-encoder/ettin-reranker-32m-v1` |
| Parámetros totales | 32.038.402 |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantización | no disponible (se distrib
