# SZLHOLDINGS/qantu

## Resumen

qantu es un repositorio publicado por SZL Holdings en Hugging Face que, según su propia model card, **no es un modelo** sino una "reserva de nombre" (roadmap organ). La organización lo describe explícitamente como "el asiento vacío" y advierte que pretender que es un modelo sería "el pecado que la doctrina prohíbe". No contiene pesos, no tiene arquitectura, no ha sido entrenado y no ofrece ninguna capacidad de inferencia.

La relevancia de esta entrada es puramente organizativa: SZL Holdings, una entidad dedicada a "infraestructura de IA gobernada" (según su perfil de GitHub), utiliza este espacio para asegurar la disponibilidad del nombre "qantu" en el ecosistema de Hugging Face, con la intención de "llenarlo más tarde con un recibo, o eliminarlo". No existe ningún artefacto técnico que evaluar, y cualquier uso como modelo sería un error.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo) |
| Parametros totales | no disponible (no hay pesos) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (no hay pesos) |

## Arquitectura y entrenamiento

No existe arquitectura ni entrenamiento. La model card declara "No weights. No train. No bench." (sin pesos, sin entrenamiento, sin benchmarks). El repositorio contiene únicamente metadatos y una declaración de intenciones. La organización menciona una "Doctrine v11" con 749 declaraciones, 14 axiomas y 163 "sorries" (término usado en asistentes de prueba como Lean), pero esto es parte de su marco filosófico interno, no de un sistema de IA.

## Capacidades

- Ninguna. El repositorio no ofrece generación de texto, razonamiento, código, visión ni ninguna otra funcionalidad.
- No soporta tool calling, agentes, ni razonamiento multi-paso.
- No tiene capacidades multilingües.
- No existe modo de pensamiento, visión ni audio.

## Casos de uso

No existen casos de uso reales como modelo. El único propósito declarado es:

- Reserva de nombre: asegurar que el identificador "qantu" no sea utilizado por terceros en Hugging Face, según la política de la organización.
- Planificación interna: servir como marcador en el "roadmap" de SZL Holdings para un posible desarrollo futuro.
- Gobernanza de activos: mantener un registro público de la intención de uso del nombre, alineado con su doctrina de "IA gobernada".

Cualquier otro uso (inferencia, fine-tuning, despliegue) es imposible por la ausencia de pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente "No bench" y en la tabla de honestidad declara que los números de la tarjeta son "ROADMAP" (hoja de ruta), no mediciones reales.

## Requisitos de hardware

No aplica. No hay modelo que ejecutar, por lo que no se requiere VRAM, GPU ni infraestructura de inferencia. No existen opciones de despliegue (vLLM, llama.cpp, Ollama, TGI, etc.) porque no hay pesos que cargar.

## Comparativa con modelos similares

No disponible. No existe ningún modelo comparable porque qantu no es un modelo. Las únicas entidades similares en Hugging Face serían otros repositorios de reserva de nombre, pero no hay datos públicos para comparar.

## Limitaciones y advertencias

- No contiene pesos: es imposible usarlo para inferencia o fine-tuning.
- No es un modelo: cualquier integración en un pipeline fallará.
- Riesgo de confusión: el nombre "qantu" podría inducir a error a quien busque un modelo real; la model card advierte explícitamente contra esta confusión.
- Licencia Apache-2.0: se aplica a los metadatos y la documentación, no a pesos inexistentes.
- Sin soporte: no hay canal de soporte técnico para este repositorio.
- Fecha de creación (2026-08-28) y actualización (2026-08-29) indican que es una entrada reciente, pero no hay actividad posterior.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SZLHOLDINGS/qantu
- Perfil de la organización en Hugging Face: https://huggingface.co/SZLHOLDINGS/models
- Organización en GitHub: https://github.com/szl-holdings
- Repositorio SZL Forge (herramienta de fine-tuning de la organización): https://github.com/szl-holdings/szl-forge
- Página "Living Anatomy" de SZL Holdings: https://a-11-oy.com/living-anatomy
