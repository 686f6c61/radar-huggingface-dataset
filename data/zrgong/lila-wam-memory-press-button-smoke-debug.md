# zrgong/lila-wam-memory-press-button-smoke-debug

## Resumen

Este repositorio contiene un checkpoint de infraestructura denominado `lila-wam-memory-press-button-smoke-debug`, publicado por el autor `zrgong` como parte del desarrollo del bucle de inferencia de RMBench para el modelo LiLa-WAM. No se trata de un modelo entrenado con fines de calidad o rendimiento, sino de una comprobación de humo (smoke test) que valida el flujo de datos y la memoria entre predicciones. El checkpoint incluye únicamente el modelo de acción entrenable de 212 millones de parámetros, mientras que el backbone DINOv3-L congelado no se redistribuye aquí.

LiLa-WAM (Lightweight Latent Reasoning World-Action Model) es un modelo mundo-acción ligero que razona sobre el futuro en un espacio latente compacto, desarrollado por el equipo de `teee000`. Según el paper arXiv 2608.03701, es entrenable de extremo a extremo en una GPU de consumo con 24 GB de memoria y alcanza un 90,48 % de éxito en 50 tareas de RoboTwin 2.0. Este checkpoint concreto, sin embargo, solo sirve para depurar el pipeline de inferencia y no debe emplearse para evaluar la calidad del modelo.

La relevancia de esta publicación radica en que permite a los desarrolladores verificar la correcta integración de la memoria persistente (páginas de 64 tokens) y el manejo del contrato de acciones antes de ejecutar entrenamientos completos. Es un artefacto técnico, no un modelo utilizable en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de acción de 212M parámetros (checkpoint de infraestructura); backbone DINOv3-L no incluido |
| Parametros totales | 212 millones (solo modelo de acción) |
| Parametros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | No disponible (el contrato usa páginas de memoria de 64 tokens por predicción) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (modelo de control robótico, sin procesamiento de lenguaje natural) |
| Licencia | No disponible |
| Formato de pesos | No disponible (probablemente safetensors, pero no se especifica) |

## Arquitectura y entrenamiento

El checkpoint corresponde a un entrenamiento de depuración con solo 2 pasos de optimizador, un tamaño de lote efectivo global de 16 y un mundo de entrenamiento de 1 GPU A100-80GB. El modelo de acción de 212M parámetros está diseñado para operar junto a un backbone DINOv3-L congelado (que no se redistribuye en este repositorio). La arquitectura general de LiLa-WAM, descrita en el paper, combina la predicción de estados futuros en un espacio latente compacto con la generación de acciones, de modo que la previsión se convierte en una señal de entrenamiento explícita en lugar de un subproducto emergente.

El contrato de inferencia especifica una entrada de mosaico RGB de 320x384 (ancho x alto) con cámaras de muñeca izquierda/derecha sobre la cabeza, un espacio de estado/acción de 14 dimensiones (6 articulaciones por brazo más 2 agarres), y un chunk de acción de 32 pasos con horizonte de ejecución de 16. La memoria se gestiona mediante una página de 64 tokens por predicción que se retiene entre llamadas, y el primer request de cada episodio debe reiniciar explícitamente la memoria. Estas características son específicas del entorno RMBench `press_button`.

## Capacidades

- No es un modelo funcional: se trata de un checkpoint de smoke test para validar la infraestructura de inferencia.
- No genera texto, código ni realiza razonamiento simbólico.
- No soporta tool calling ni agentes conversacionales.
- No tiene capacidades multilingües.
- Su única función es ejercitar el bucle de inferencia con el contrato RMBench `press_button`, verificando que la memoria persistente y el flujo de tensores funcionan correctamente.

## Casos de uso

- Desarrollo y depuración del pipeline de inferencia de RMBench: permite verificar que el modelo de acción recibe correctamente las entradas RGB y produce salidas de 14 dimensiones con el chunk de 32 pasos.
- Validación de la gestión de memoria persistente: comprueba que las páginas de 64 tokens se retienen entre predicciones y que el reset explícito al inicio de cada episodio funciona.
- Integración con el backbone DINOv3-L: sirve para probar la conexión entre el modelo de acción y el backbone congelado antes de un entrenamiento completo.
- Pruebas de rendimiento del bucle de inferencia: permite medir latencia y throughput del sistema en condiciones controladas, aunque sin garantías de calidad del modelo.
- Verificación de compatibilidad de formatos de peso y cuantización en diferentes runtimes (vLLM, llama.cpp, etc.) si se desea desplegar el checkpoint en entornos de prueba.
- Reproducción de errores y regresiones en el desarrollo de RMBench: al ser un checkpoint mínimo, facilita el aislamiento de fallos en el flujo de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para este checkpoint específico. El paper de LiLa-WAM reporta un 90,48 % de éxito en 50 tareas de RoboTwin 2.0 para el modelo completo, pero estos resultados no son aplicables a este artefacto de smoke test, que no ha sido entrenado con suficientes pasos para alcanzar ningún nivel de competencia.

## Requisitos de hardware

- El checkpoint ocupa 0.4 GB, por lo que cabe en cualquier GPU con al menos 1 GB de VRAM.
- Para ejecutar el modelo completo de LiLa-WAM (con backbone DINOv3-L) se requiere una GPU con 24 GB de VRAM, como una RTX 3090, RTX 4090 o A5000.
- El entrenamiento del modelo completo se ha realizado en una A100-80GB, pero la inferencia puede ejecutarse en GPUs de consumo.
- Opciones de despliegue: dado que es un checkpoint de infraestructura, no se recomienda su uso con vLLM, Ollama u otros runtimes de inferencia estándar. Su propósito es el desarrollo del bucle RMBench.
- Latencia y throughput: no disponibles, ya que no se han realizado mediciones sobre este checkpoint.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros modelos. LiLa-WAM pertenece a la categoría de world-action models para manipulación robótica, junto con otros como RT-2 o Octo, pero este checkpoint concreto no tiene métricas comparables. Se recomienda consultar el paper original para comparaciones de rendimiento del modelo completo.

## Limitaciones y advertencias

- Este checkpoint no es un modelo entrenado: solo ha recibido 2 pasos de optimizador, por lo que no produce acciones útiles para ninguna tarea.
- No debe utilizarse para evaluar la calidad del modelo LiLa-WAM ni para extraer conclusiones sobre su rendimiento.
- El backbone DINOv3-L no está incluido, por lo que el checkpoint es inutilizable sin ese componente.
- No se especifica licencia, lo que impide su uso comercial sin autorización explícita del autor.
- El contrato de inferencia está fijado para RMBench `press_button`; no es generalizable a otros entornos sin modificaciones.
- La memoria persistente requiere un reset explícito al inicio de cada episodio; olvidar este paso provocará comportamientos incorrectos en la inferencia.
- No hay garantías de estabilidad numérica ni de reproducibilidad más allá del SHA-256 indicado en el manifiesto.

## Enlaces

- HuggingFace: https://huggingface.co/zrgong/lila-wam-memory-press-button-smoke-debug
- GitHub del proyecto LiLa-WAM: https://github.com/teee000/LiLa-WAM
- Paper arXiv: https://arxiv.org/abs/2608.03701
- PDF del paper: https://arxiv.org/pdf/2608.03701
- Página del proyecto: https://teee000.github.io/LiLa-WAM-page/
