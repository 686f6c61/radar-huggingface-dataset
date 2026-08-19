# t8star/minimax_h3_turbo_4step_10ErosMax_test4_pruned_curveproj1025_T8

## Resumen

Este repositorio contiene un LoRA de aceleración experimental para el modelo MiniMax H3, desarrollado por el usuario t8star. Se trata de un adaptador independiente que permite ejecutar el modelo de generación de vídeo con audio sincronizado (familia FL2VA) en solo cuatro pasos de inferencia dentro de ComfyUI. El LoRA está diseñado específicamente para un checkpoint local concreto, un fine-tune pruned de 40 GB denominado `10Eros_Max_h3_fl2va_bf16_test4_pruned.safetensors`, y no es compatible con otros checkpoints.

El problema que resuelve es la incompatibilidad dimensional entre el LoRA Turbo estándar de cuatro pasos y el checkpoint pruned. Mientras que el LoRA original espera una entrada AdaLN de 2688 dimensiones, el checkpoint pruned utiliza una tabla de coordenadas de solo 8 dimensiones. Este LoRA convierte los 51 adaptadores AdaLN incompatibles mediante una proyección por mínimos cuadrados sobre la cuadrícula de 1025 puntos, conservando los 208 adaptadores de atención/MLP que ya eran compatibles. El resultado es un LoRA de 569 tensores que restaura la funcionalidad de aceleración sin necesidad de eliminar los adaptadores AdaLN.

La relevancia actual radica en que permite utilizar un fine-tune pruned de MiniMax H3 con generación en cuatro pasos, algo que no era posible con los LoRA Turbo existentes. Es una pieza de ingeniería inversa y adaptación técnica que demuestra cómo abordar incompatibilidades de arquitectura en modelos derivados, aunque su uso está estrictamente limitado al checkpoint exacto documentado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA de aceleración sobre MiniMax H3 (FL2VA, texto a vídeo + audio sincronizado) |
| Parametros totales | No disponible (el LoRA contiene 569 tensores; el modelo base pruned tiene 532 tensores y 40,2 GB) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | BF16 para adaptadores A/B, FP32 para tensores `.diff_b` |
| Idiomas soportados | Chino (zh), inglés (en) |
| Licencia | MiniMax H3 Community License Agreement |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Este LoRA no ha sido entrenado ni destilado desde cero. Es una conversión matemática de un LoRA Turbo estándar de cuatro pasos (proveniente de `larryvrh/MiniMax-H3-Turbo-Lora`, línea no-EMA inicial) para adaptarlo a un checkpoint pruned con una tabla de coordenadas AdaLN de 8 dimensiones. La conversión utiliza un ajuste por mínimos cuadrados afín sobre la cuadrícula de 1025 puntos `t_j = j/1024`. Para cada adaptador AdaLN original `A ∈ R^(16×2688)` y `B ∈ R^(d_out×16)`, se proyecta la entrada de 2688 dimensiones a 8 dimensiones mediante la pseudo-inversa de la matriz `[C, 1]`, donde `C` es la tabla de coordenadas. El término constante resultante se incorpora como un bias adicional `.diff_b` en FP32, que es imprescindible para conservar la respuesta del LoRA original (sin él se pierde entre el 94% y el 99,8% de la señal).

Los 208 adaptadores de atención/MLP que ya eran compatibles se mantienen byte a byte idénticos a la fuente. El resultado son 259 pares A/B más 51 parches de bias, totalizando 569 tensores. La verificación estructural confirma que los 569 tensores se consumen correctamente en ComfyUI. No se utilizaron los pesos cuantizados del Transformer de referencia, solo cuatro tensores FP32 del time-embedder.

## Capacidades

- Aceleración de inferencia de MiniMax H3 a cuatro pasos de muestreo (frente a los pasos completos del modelo original).
- Generación de vídeo con audio estereofónico sincronizado (familia FL2VA).
- Compatibilidad con ComfyUI mediante carga de LoRA estándar (259 adaptadores bypass + 51 parches de bias).
- Funcionamiento exclusivo con el checkpoint pruned documentado, identificado por su SHA-256.
- Preservación de la respuesta AdaLN completa gracias a los bias `.diff_b` en FP32.
- No requiere reentrenamiento ni destilación adicional.

## Casos de uso

- Generación de vídeo con audio en ComfyUI a alta velocidad: el LoRA permite obtener resultados en cuatro pasos, reduciendo drásticamente el tiempo de inferencia respecto al modelo original, ideal para iteraciones rápidas de diseño audiovisual.
- Prototipado de contenido para producción: los creadores que ya utilicen el checkpoint `10Eros_Max_h3_fl2va_bf16_test4_pruned` pueden integrar este LoRA en flujos de trabajo de ComfyUI para generar clips de prueba con audio sincronizado sin esperar largos tiempos de muestreo.
- Investigación sobre adaptación de LoRA a checkpoints pruned: este repositorio documenta una metodología de proyección de adaptadores AdaLN mediante ajuste por mínimos cuadrados, útil para quienes estudien cómo adaptar LoRA a arquitecturas con representaciones de tiempo comprimidas.
- Evaluación de la calidad de generación en cuatro pasos frente a más pasos: los investigadores pueden comparar la salida de este LoRA con la del checkpoint sin acelerar para medir la pérdida de calidad introducida por la destilación.
- Desarrollo de herramientas de compatibilidad para ComfyUI: el enfoque de conversión puede servir como referencia para implementar utilidades que automaticen la adaptación de LoRA a checkpoints con tablas de coordenadas alternativas.
- Uso educativo en ingeniería inversa de modelos multimodales: el código y la documentación muestran cómo analizar la estructura interna de un LoRA y cómo resolver discrepancias dimensionales, lo que resulta valioso para estudiantes de posgrado en IA generativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona métricas objetivas de calidad de vídeo (como FVD, CLIP score) ni de rendimiento (tiempo por clip, throughput). La única validación documentada es la verificación estructural de que los 569 tensores se cargan correctamente en ComfyUI y que la respuesta AdaLN se conserva (con una pérdida del 94%–99,8% si se omiten los bias, lo que confirma la necesidad de los `.diff_b`).

## Requisitos de hardware

- El LoRA en sí ocupa aproximadamente 758 MiB (794.888.696 bytes), por lo que su huella en VRAM es despreciable.
- El checkpoint principal `10Eros_Max_h3_fl2va_bf16_test4_pruned.safetensors` pesa 40,2 GB, lo que requiere una GPU con al menos 48 GB de VRAM para cargar el modelo completo en BF16, o más si se necesita espacio para activaciones y el proceso de muestreo.
- GPU recomendadas: NVIDIA A100 80GB, H100 80GB, o GPUs profesionales con 48GB o más (por ejemplo, RTX A6000 48GB). En GPUs de consumo como la RTX 4090 (24GB) no es factible cargar el modelo completo sin cuantización adicional, que no se contempla en este LoRA.
- El despliegue se realiza exclusivamente a través de ComfyUI con el nodo de carga de LoRA estándar. No se mencionan otros backends como vLLM o llama.cpp, ya que el modelo es multimodal y está diseñado para el flujo de ComfyUI.
- No se proporcionan datos de latencia ni throughput. El objetivo del LoRA es reducir el número de pasos de 50+ a 4, lo que acelera la inferencia aproximadamente en un orden de magnitud, pero los valores concretos dependen del hardware y de la resolución de salida.

## Comparativa con modelos similares

| Modelo | Tipo | Pasos | Compatibilidad | Licencia |
|---|---|---|---|---|
| Este LoRA (t8star) | LoRA de aceleración | 4 | Solo checkpoint pruned específico | MiniMax H3 Community License |
| larryvrh/MiniMax-H3-Turbo-Lora | LoRA de aceleración estándar | 4 | Checkpoints completos de MiniMax H3 (no pruned) | MiniMax H3 Community License |
| MiniMaxAI/MiniMax-H3 (base) | Modelo completo | 50+ | Cualquier checkpoint compatible | MiniMax H3 Community License |

La diferencia clave es la compatibilidad: el LoRA estándar de larryvrh no funciona con el checkpoint pruned de 10Eros debido a la discrepancia dimensional en AdaLN. Este LoRA resuelve esa limitación específica. No hay otros LoRA públicos que aborden la misma adaptación a checkpoints pruned con tabla de curvas, por lo que no existe una comparativa directa más amplia.

## Limitaciones y advertencias

- Compatibilidad extremadamente restringida: solo funciona con el archivo `10Eros_Max_h3_fl2va_bf16_test4_pruned.safetensors` cuyo SHA-256 es `f82cc3f723b080e7ae94a7c98f95aa989e387618d0bdc940133dfbd9f432c062`. Cualquier otro checkpoint, incluso con el mismo nombre, producirá errores o resultados incorrectos.
- Estado experimental: el autor lo califica como "candidato de compatibilidad experimental" y no garantiza su funcionamiento en todos los entornos de ComfyUI.
- No es un modelo independiente: requiere el checkpoint pruned local, que no se incluye en este repositorio y cuyos derechos de redistribución deben verificarse por separado.
- Licencia restrictiva: la MiniMax H3 Community License Agreement define territorios excluidos, condiciones de redistribución, términos comerciales y políticas de uso aceptable. Es obligatorio incluir el aviso de licencia y NOTICE en cualquier distribución derivada.
- Riesgo de alucinación y sesgos: al ser un LoRA de aceleración, no introduce nuevas capacidades, pero hereda los sesgos y limitaciones del modelo base MiniMax H3 y del fine-tune 10Eros, que no están documentados en este repositorio.
- Sin soporte para otros idiomas: solo se declaran chino e inglés, aunque el modelo base podría tener capacidades multilingües no verificadas.
- Sin garantía de calidad: no hay benchmarks publicados, por lo que la calidad de salida en cuatro pasos no está objetivamente validada frente al modelo completo.

## Enlaces

- Repositorio del LoRA: https://huggingface.co/t8star/minimax_h3_turbo_4step_10ErosMax_test4_pruned_curveproj1025_T8
- LoRA Turbo original de referencia: https://huggingface.co/larryvrh/MiniMax-H3-Turbo-Lora
- Proyecto de destilación MiniMax-H3-Turbo (ModelTC): https://github.com/ModelTC/Minimax-H3-Turbo
- Licencia MiniMax H3 Community License Agreement: https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/LICENSE
- Modelo base MiniMax-H3: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Modelo base adaptado para ComfyUI: https://huggingface.co/Comfy-Org/MiniMax-H3
