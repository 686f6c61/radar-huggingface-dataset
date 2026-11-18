# Zizizi-hao/NegWAM

## Resumen

NegWAM es un modelo de conducción autonoma end-to-end desarrollado por Zihao Zhang, Xinyu Zhang, Bing Zeng, Xingyu Chen, Zhenning Li, Bin Yu y Ziyuan Pu, presentado en el paper "Reinforcing End-to-End Autonomous Driving Safety via Negative-Aware Planning in a Unified World-Action Model". El modelo resuelve el problema de la planificación de trayectorias seguras en entornos de conducción, aprendiendo de trayectorias de fallo cercanas al experto (near-expert failure trajectories) mediante el uso de anclas repulsivas y tokens de escena condicionados (rider tokens).

La arquitectura es un transformer 3D basado en Diffusers, denominado `WanTransformer3DNavSimModel`, con 6.243.520.990 parametros totales (aproximadamente 6.24 mil millones) y pesos en formato safetensors BF16 con un tamano de 12.49 GB. El modelo toma como entrada observaciones de camara, estado e historial del ego y comandos de navegacion, y produce 8 poses del ego (x, y, heading) durante 4 segundos a intervalos de 0.5 segundos.

El modelo es relevante ahora porque aborda la seguridad en la conducción autonoma mediante un marco de post-entrenamiento que integra un world-action model unificado, con resultados destacados en el benchmark NAVSIM v2 (93.3 EPDMS en navtest y 40.4 en navhard). Su licencia Apache 2.0 y su integracion con Diffusers facilitan su adopcion tanto en investigacion como en desarrollo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer 3D (`WanTransformer3DNavSimModel`, implementacion custom basada en Diffusers) |
| Parametros totales | 6.243.520.990 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (BF16) |

## Arquitectura y entrenamiento

NegWAM se basa en un transformer 3D unificado que integra un world model y un action model para la conducción end-to-end. El modelo procesa observaciones de camara, el estado y historial del ego y comandos de navegacion para generar trayectorias futuras. La innovacion principal es el marco de post-entrenamiento negative-aware: se aprenden trayectorias de fallo cercanas al experto (near-expert failure trajectories) y se utilizan anclas repulsivas para alejar las predicciones de estas alternativas inseguras. Ademas, se introducen rider tokens condicionados por la escena que aprenden la compatibilidad entre escena y trayectoria; esta rama auxiliar se usa solo durante el entrenamiento y se omite en la inferencia.

No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF/DPO en la informacion proporcionada. El paper asociado (arXiv:2611.08111) contiene los detalles del protocolo de entrenamiento y evaluacion.

## Capacidades

- Planificacion de trayectorias end-to-end para conduccion autonoma: genera 8 poses del ego (x, y, heading) durante 4 segundos a intervalos de 0.5 segundos.
- Procesamiento de observaciones de camara multi-vista y estado/historial del ego.
- Interpretacion de comandos de navegacion para condicionar la planificacion.
- World-action model unificado: integra modelado del mundo y planificacion de acciones.
- Post-entrenamiento negative-aware: aprendizaje de trayectorias de fallo para mejorar la seguridad.
- Rider tokens: aprendizaje de compatibilidad escena-trayectoria (solo en entrenamiento).
- Evaluacion en benchmarks NAVSIM v2 (navtest y navhard) y HUGSIM (zero-shot closed-loop).
- No se dispone de informacion sobre soporte de tool calling, agentes multi-paso, capacidades multilingues ni modos de pensamiento (thinking mode).

## Casos de uso

- Planificacion de trayectorias en vehiculos autonomos: el modelo genera trayectorias futuras de 4 segundos a partir de observaciones de camara y comandos de navegacion, adecuado para sistemas de conducción urbana y autopista.
- Evaluacion de seguridad en simulacion: permite comparar trayectorias generadas con alternativas de fallo cercanas al experto, gracias al marco negative-aware, para analizar riesgos antes de desplegar en vehiculos reales.
- Investigacion en world-action models: sirve como base para estudiar la integracion de world models y action models en conducción end-to-end, con pesos abiertos y licencia permisiva.
- Benchmarking en NAVSIM v2: el modelo puede usarse como referencia en navtest y navhard para comparar nuevos metodos de planificacion.
- Evaluacion closed-loop en HUGSIM: permite validar el modelo en entornos simulados zero-shot, adecuado para pruebas de robustez antes de pruebas en pista.
- Desarrollo de sistemas ADAS: la planificacion de trayectorias a 0.5 segundos de resolucion puede integrarse en sistemas de asistencia a la conducción que requieren predicciones a corto plazo.
- Fine-tuning para dominios especificos: al estar disponible en safetensors y con licencia Apache 2.0, puede adaptarse a escenarios de conducción concretos (parking, entornos rurales) con datos propios.

## Benchmarks y rendimiento

| Benchmark | Split / protocolo | EPDMS ↑ |
|---|---|---|
| NAVSIM v2 | navhard, two-stage | 40.4 |
| NAVSIM v2 | navtest | 93.3 |

Las puntuaciones se presentan en escala 0–100 y redondeadas a un decimal. Provienen de la fila resumen `extended_pdm_score_combined` para navhard y de `average_all_frames` para navtest. El paper tambien reporta evaluacion closed-loop zero-shot en HUGSIM, pero los resultados no se detallan en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en BF16 ocupan aproximadamente 12.49 GB, por lo que se necesita al menos 13-14 GB de VRAM solo para cargar el modelo; con overhead de activaciones y procesamiento de imagenes se recomienda 16-24 GB.
- GPU recomendadas: A100 (40/80 GB), H100 (80 GB), RTX 4090 (24 GB) para inferencia en BF16.
- Cabe en GPU consumer: si, en RTX 4090 (24 GB) y potencialmente en RTX 3090 (24 GB) con BF16; en GPUs de 16 GB requeriria cuantizacion, aunque no se dispone de informacion sobre soporte de cuantizacion.
- Opciones de despliegue: no se dispone de informacion sobre integracion con vLLM, llama.cpp, Ollama o TGI; el modelo usa una implementacion custom basada en Diffusers y requiere el codigo del repositorio GitHub para su ejecucion.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la informacion proporcionada. NegWAM es un modelo especializado en conducción autonoma end-to-end con un marco negative-aware, y no se han identificado alternativas directas con las mismas caracteristicas en los datos disponibles.

## Limitaciones y advertencias

- El modelo esta especializado exclusivamente en conducción autonoma y planificacion de trayectorias; no es un modelo de proposito general.
- No se dispone de informacion sobre sesgos conocidos, riesgo de alucinacion ni limitaciones de contexto o idioma.
- La rama de rider tokens se usa solo en entrenamiento y se omite en inferencia; su comportamiento en produccion no esta documentado en la informacion disponible.
- La evaluacion se limita a benchmarks de simulacion (NAVSIM v2 y HUGSIM); no se dispone de resultados en vehiculos reales.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar el paper y el repositorio GitHub para condiciones adicionales.
- El modelo requiere la implementacion custom del repositorio GitHub; no es directamente compatible con pipelines estandar de Diffusers sin adaptacion.
- No se dispone de informacion sobre cuantizacion, lo que limita el despliegue en GPUs con menos de 16 GB de VRAM.

## Enlaces

- [Hugging Face - Zizizi-hao/NegWAM](https://huggingface.co/Zizizi-hao/NegWAM)
- [Paper - arXiv:2611.08111](https://arxiv.org/abs/2611.08111)
- [Codigo y setup - GitHub](https://github.com/Zizizi-hao/NegWAM)
- [Archivos del modelo](https://huggingface.co/Zizizi-hao/NegWAM/tree/main)
- [Licencia Apache 2.0](https://github.com/Zizizi-hao/NegWAM/blob/main/LICENSE)
- [Roadmap de release de codigo](https://github.com/Zizizi-hao/NegWAM#-roadmap--code-release)
